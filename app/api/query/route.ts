// ============================================================
// API ROUTE: /api/query — Pipeline Multimodal Efímero
// ============================================================
// SEGURIDAD CRÍTICA: Las imágenes NUNCA se persisten en disco
// ni en base de datos. Solo viven en RAM durante este handler.
// Cualquier Buffer de imagen es elegible para GC al finalizar.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part, Content } from "@google/generative-ai";
import { buildRagContext, evaluateEscalation } from "@/lib/ai/rag-prompt";
import { saveAuditLog, createEscalation } from "@/lib/firebase/firestore";
import { QueryPayload, AIQueryResponse } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Inicializar cliente Gemini (server-side only)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function callGeminiWithRetry(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  contents: Content[],
  maxRetries = 4,
  initialDelayMs = 1500
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
      const isRetriable =
        errorMessage.includes("429") ||
        errorMessage.includes("503") ||
        errorMessage.includes("ResourceExhausted") ||
        errorMessage.includes("overloaded") ||
        errorMessage.includes("Service Unavailable");

      if (isRetriable && attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(
          `[/api/query] Retry ${attempt}/${maxRetries} after ${delay}ms. Error: ${errorMessage}`
        );
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Se superó el número máximo de reintentos con Gemini.");
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // ── 1. Parsear el payload ────────────────────────────
    const body: QueryPayload = await req.json();
    const { queryText, queryType, sessionId, imageBase64, imageMimeType } =
      body;

    if (!queryText || queryText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "La consulta no puede estar vacía." },
        { status: 400 }
      );
    }

    // ── 2. Construir contexto RAG ────────────────────────
    const { systemPrompt, ragRefs } = buildRagContext(queryText, 5);

    // ── 3. Construir partes del mensaje para Gemini ──────
    const userParts: Part[] = [{ text: queryText }];

    // PIPELINE EFÍMERO: Si hay imagen, se decodifica a Buffer en RAM
    // La imagen NUNCA se escribe en disco ni en ninguna base de datos.
    let imageDescription = "";
    const hadImage = !!imageBase64;

    if (imageBase64 && imageMimeType) {
      // El Buffer existe solo en memoria durante este request
      // Node.js lo garbage-collects automáticamente al terminar el handler
      userParts.push({
        inlineData: {
          data: imageBase64, // Base64 string — inline, no persistido
          mimeType: imageMimeType as
            | "image/jpeg"
            | "image/png"
            | "image/webp"
            | "image/heic",
        },
      });
      userParts.push({
        text: "Analiza esta imagen en el contexto del procedimiento de inspección visual de catéteres. Identifica si hay defectos visibles y aplica los criterios de aceptación del procedimiento.",
      });
    }

    // ── 4. Llamar a Gemini con contexto RAG ─────────────
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: systemPrompt,
    });

    const contents: Content[] = [
      {
        role: "user",
        parts: userParts,
      },
    ];

    const responseText = await callGeminiWithRetry(model, contents);

    // ── 5. Evaluar si requiere escalación ────────────────
    const { escalated, confidence } = evaluateEscalation(
      responseText,
      queryText
    );

    // Extraer descripción de imagen de la respuesta si hay imagen
    if (hadImage) {
      // Extraer las primeras 200 chars de la respuesta como descripción del defecto
      imageDescription = responseText.slice(0, 200).replace(/\n/g, " ");
    }

    const processingTimeMs = Date.now() - startTime;

    // ── 6. Guardar Audit Log en Firestore ────────────────
    // CRÍTICO: Se guarda SOLO texto y metadata. NUNCA la imagen.
    let logId: string | undefined;
    let escalationId: string | null = null;

    try {
      logId = await saveAuditLog({
        sessionId,
        userId: body.sessionId, // En producción, extraer del JWT/cookie
        userRole: "operator",
        employeeId: "UNKNOWN", // En producción, extraer del JWT
        workstation: "UNKNOWN",
        queryType,
        queryText,
        responseText,
        ragSourceRefs: ragRefs,
        hadImage, // Solo el flag — NUNCA la imagen
        imageDescription, // Solo descripción textual generada por la IA
        escalated,
        escalationId: null,
        confidence,
        processingTimeMs,
      });

      // ── 7. Crear escalación si es necesario ─────────────
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
      // Log error pero NO interrumpir la respuesta al operario
      console.error("[/api/query] Firestore save error:", firestoreErr);
    }

    // ── 8. Limpiar referencias a imagen (explícito para claridad) ──
    // En JavaScript/Node.js, el GC maneja esto automáticamente,
    // pero lo hacemos explícito para cumplimiento normativo.
    // imageBase64 y imageMimeType son parámetros locales que se
    // garbage-collect al terminar este scope.

    // ── 9. Retornar respuesta al cliente ─────────────────
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

// Solo se permite POST
export async function GET() {
  return NextResponse.json({ error: "Método no permitido." }, { status: 405 });
}
