// ============================================================
// API ROUTE: /api/query — Pipeline RAG Estático (Grounded)
// ============================================================
// Enfoque determinista con baja latencia y alta precisión.
// Las consultas del operario se contrastan contra la base de
// conocimiento estructurada en /lib/knowledge/catheter-standards.ts
// mediante coincidencia de palabras clave/semántica.
//
// SEGURIDAD CRÍTICA: Las imágenes recibidas son 100% efímeras,
// se procesan en RAM del Route Handler y nunca se persisten.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part, Content } from "@google/generative-ai";
import { buildRagContext, evaluateEscalation } from "@/lib/ai/rag-prompt";
import { saveAuditLog, createEscalation } from "@/lib/firebase/firestore";
import { QueryPayload, AIQueryResponse } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Inicializar cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function callGeminiWithRetry(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  contents: Content[],
  maxRetries = 8,
  initialDelayMs = 1000
): Promise<string> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const result = await model.generateContent({ contents });
      return result.response.text().trim();
    } catch (err: unknown) {
      attempt++;
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      
      // No reintentar en errores de credenciales o configuración (400, 403)
      const isClientError = 
        errorMessage.includes("400") || 
        errorMessage.includes("403") || 
        errorMessage.includes("API_KEY_INVALID") || 
        errorMessage.includes("not valid");

      const isRetriable = !isClientError;

      if (isRetriable && attempt < maxRetries) {
        // Backoff exponencial con un pequeño jitter (desviación aleatoria) para no saturar
        const jitter = Math.random() * 300;
        const delay = initialDelayMs * Math.pow(1.8, attempt - 1) + jitter;
        
        console.warn(
          `[/api/query] Intento de reintento ${attempt}/${maxRetries} en ${Math.round(delay)}ms debido a error de demanda/red: ${errorMessage.slice(0, 120)}`
        );
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Se superó el número máximo de reintentos con Gemini debido a alta demanda.");
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body: QueryPayload = await req.json();
    const { queryText, queryType, sessionId, imageBase64, imageMimeType } =
      body;

    if (!queryText || queryText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "La consulta no puede estar vacía." },
        { status: 400 }
      );
    }

    // ── 1. Construir contexto RAG Estático ────────────────
    // Recupera los chunks de texto pre-extraídos que coinciden
    const { systemPrompt, ragRefs } = buildRagContext(queryText, 5);

    // ── 2. Construir partes del mensaje para Gemini ──────
    const userParts: Part[] = [{ text: queryText }];
    let imageDescription = "";
    const hadImage = !!imageBase64;

    // Procesamiento efímero de imágenes
    if (imageBase64 && imageMimeType) {
      userParts.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType as
            | "image/jpeg"
            | "image/png"
            | "image/webp"
            | "image/heic",
        },
      });
      userParts.push({
        text: "Analiza esta imagen adjunta en el contexto del procedimiento de inspección visual de catéteres y los criterios de aceptación especificados.",
      });
    }

    // Refuerzo explícito de idioma y completitud al final del prompt
    userParts.push({
      text: "\nIMPORTANTE: Debes responder obligatoriamente en ESPAÑOL. Proporciona una respuesta completa y detallada sin cortarte a la mitad. Sigue las reglas de formato: indica si se acepta o rechaza al inicio, explica el criterio técnico en español, y cita la sección de referencia al final en el formato [REF: Sección X.X].",
    });

    // ── 3. Llamar a Gemini con el System Prompt RAG estructurado ──────
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.1, // Baja temperatura para consistencia
        maxOutputTokens: 2048, // Aumentar para evitar cualquier corte por tokens
      },
    });

    const contents: Content[] = [
      {
        role: "user",
        parts: userParts,
      },
    ];

    const responseText = await callGeminiWithRetry(model, contents);

    // LOG DE CONSOLA CRÍTICO EN EL SERVIDOR para auditar la respuesta original
    console.log("==========================================");
    console.log(`[API RESPONSE] Longitud original: ${responseText.length} caracteres`);
    console.log("Respuesta obtenida de la API:");
    console.log(responseText);
    console.log("==========================================");

    // ── 4. Evaluar escalación ───────────────────────────
    const { escalated, confidence } = evaluateEscalation(
      responseText,
      queryText
    );

    if (hadImage) {
      imageDescription = responseText.slice(0, 200).replace(/\n/g, " ");
    }

    const processingTimeMs = Date.now() - startTime;

    // ── 5. Registrar en Firestore (Solo Auditoría de texto) ─
    let logId: string | undefined;
    let escalationId: string | null = null;

    try {
      logId = await saveAuditLog({
        sessionId,
        userId: sessionId,
        userRole: "operator",
        employeeId: "UNKNOWN",
        workstation: "UNKNOWN",
        queryType,
        queryText,
        responseText,
        ragSourceRefs: ragRefs,
        hadImage,
        imageDescription,
        escalated,
        escalationId: null,
        confidence,
        processingTimeMs,
      });

      if (escalated) {
        escalationId = await createEscalation({
          logId: logId ?? uuidv4(),
          userId: "UNKNOWN",
          userDisplayName: "Operario",
          employeeId: "UNKNOWN",
          workstation: "UNKNOWN",
          shift: "A",
          queryText,
          aiResponse: responseText,
          status: "pending",
          priority: "normal",
          assignedSupervisorId: null,
          supervisorNotes: null,
        });
      }
    } catch (firestoreErr) {
      console.error("[/api/query] Firestore log error:", firestoreErr);
    }

    // ── 6. Retornar respuesta al cliente ─────────────────
    const response: AIQueryResponse = {
      response: responseText,
      escalated,
      confidence,
      ragRefs,
      processingTimeMs,
      imageDescription: hadImage ? imageDescription : undefined,
      logId,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (err: unknown) {
    console.error("[/api/query] Error:", err);
    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método no permitido." }, { status: 405 });
}
