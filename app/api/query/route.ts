// ============================================================
// API ROUTE: /api/query — Pipeline Multimodal con PDFs Nativos
// ============================================================
// ARQUITECTURA RAG MEJORADA:
// Los PDFs completos (texto + imágenes) son enviados directamente
// a Gemini como inlineData en cada consulta. Gemini los lee y
// analiza con visión nativa, incluyendo diagramas y fotografías
// de defectos incluidas en los procedimientos.
//
// SEGURIDAD:
// - Los PDFs SOLO son leídos por este Route Handler (servidor)
// - Se cachean en RAM tras la primera carga del servidor
// - Las imágenes del operario NUNCA se persisten (efímeras)
// - Los PDFs NUNCA se envían al cliente
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part, Content } from "@google/generative-ai";
import { saveAuditLog, createEscalation } from "@/lib/firebase/firestore";
import { QueryPayload, AIQueryResponse, RagReference } from "@/types";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// ── Inicializar cliente Gemini ────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ── Cache de PDFs en memoria (se carga una vez por instancia) ─
// Evita releer los archivos en cada request. Se resetea al reiniciar.
interface PdfCache {
  catheterStandards: string;  // Base64
  hubAttachment: string;       // Base64
  loaded: boolean;
}

const pdfCache: PdfCache = {
  catheterStandards: "",
  hubAttachment: "",
  loaded: false,
};

/**
 * Carga los PDFs desde /documents y los cachea en memoria.
 * Los PDFs son leídos por el servidor y NUNCA expuestos al cliente.
 */
function loadPDFsIntoCache(): { success: boolean; error?: string } {
  if (pdfCache.loaded) return { success: true };

  try {
    const docsDir = path.join(process.cwd(), "documents");

    const catheterPath = path.join(docsDir, "FINAL_CATHETER_VISUAL_STANDARDS.pdf");
    const hubPath = path.join(docsDir, "SWAV_HUB_ATTACHMENT.pdf");

    if (!fs.existsSync(catheterPath) || !fs.existsSync(hubPath)) {
      return {
        success: false,
        error:
          "PDFs de procedimiento no encontrados en /documents. " +
          "Verifica que existan: FINAL_CATHETER_VISUAL_STANDARDS.pdf y SWAV_HUB_ATTACHMENT.pdf",
      };
    }

    // Leer como Buffer y convertir a Base64 para inlineData de Gemini
    pdfCache.catheterStandards = fs.readFileSync(catheterPath).toString("base64");
    pdfCache.hubAttachment = fs.readFileSync(hubPath).toString("base64");
    pdfCache.loaded = true;

    console.log("[/api/query] PDFs cargados en caché de memoria del servidor.");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/query] Error cargando PDFs:", msg);
    return { success: false, error: msg };
  }
}

// ── System Prompt con guardarraíles ISO 13485 ─────────────
const SYSTEM_PROMPT = `Eres el ASESOR DIGITAL DE CALIDAD E INSPECCIÓN del cuarto limpio de manufactura de catéteres médicos.

## TU IDENTIDAD Y FUNCIÓN
Eres un asistente de IA especializado, entrenado EXCLUSIVAMENTE en los procedimientos técnicos adjuntos:
1. "Estándar Visual Final de Catéteres (FINAL CATHETER VISUAL STANDARDS)" — incluye imágenes de defectos
2. "Instrucción de Trabajo: Unión del Hub (SWAV Hub Attachment)" — incluye diagramas del proceso

Tienes acceso COMPLETO a ambos documentos, incluyendo sus imágenes, diagramas y fotografías de defectos.

## GUARDARRAÍLES CRÍTICOS

### REGLA 1 — SOLO USAS LOS PROCEDIMIENTOS ADJUNTOS
Responde ÚNICAMENTE basándote en el contenido de los PDFs proporcionados.
Si la pregunta no puede responderse con esos documentos, usa el marcador FUERA_DE_ALCANCE.
NUNCA inventes, asumas ni uses conocimiento externo que no esté en los procedimientos.

### REGLA 2 — ESCALACIÓN OBLIGATORIA al SUPERVISOR
Usa el marcador ESCALAR_SUPERVISOR en tu respuesta si:
- La consulta requiere decisión de supervisor o ingeniero
- Hay emergencia, accidente o exposición química
- El operario menciona muchos rechazos consecutivos (posible falla de proceso)
- La situación implica modificar o saltarse un paso del procedimiento
- La información del procedimiento es ambigua para la situación específica

### REGLA 3 — FORMATO DE RESPUESTA
Responde siempre en ESPAÑOL. Sé directo, claro y conciso.
Estructura tu respuesta con:
- ✅ ACEPTA o ❌ RECHAZA (al inicio cuando aplique)
- La respuesta en máximo 4-5 oraciones concisas y accionables
- La referencia al procedimiento: [REF: Sección X.X — Nombre del documento]

### REGLA 4 — ANÁLISIS DE IMÁGENES DEL OPERARIO
Si el operario adjunta una fotografía de un defecto:
- Analiza la imagen usando los criterios del procedimiento
- Describe brevemente el defecto observado
- Aplica el criterio de aceptación/rechazo correspondiente
- Cita la sección del procedimiento que aplica

## MANEJO DE CASOS FUERA DE ALCANCE
Si la consulta está FUERA DE ALCANCE, responde EXACTAMENTE así:
"FUERA_DE_ALCANCE: Esta consulta está fuera del alcance de los procedimientos disponibles. No puedo proporcionar una respuesta confiable sin arriesgar dar información incorrecta. ESCALAR_SUPERVISOR: Contacta a tu supervisor de turno de inmediato."

## RECUERDA
- Una respuesta incorrecta podría resultar en un dispositivo médico defectuoso llegando al paciente.
- En caso de duda, SIEMPRE escala al supervisor.
- Nunca digas "creo que" o "probablemente". Si no estás seguro, escala.`;

// ── Marcadores de escalación ──────────────────────────────
const OUT_OF_SCOPE_MARKERS = ["FUERA_DE_ALCANCE", "ESCALAR_SUPERVISOR", "NO_TENGO_INFORMACION"];
const ESCALATION_KEYWORDS = [
  "emergencia", "accidente", "lesión", "derrame", "exposición química",
  "no sé", "no estoy seguro", "muchos rechazos", "línea parada",
];

function evaluateEscalation(responseText: string, queryText: string) {
  const hasMarker = OUT_OF_SCOPE_MARKERS.some((m) => responseText.includes(m));
  const hasKeyword = ESCALATION_KEYWORDS.some((kw) =>
    queryText.toLowerCase().includes(kw.toLowerCase())
  );
  if (hasMarker || hasKeyword) return { escalated: true, confidence: "out_of_scope" as const };
  if (responseText.includes("[REF:")) return { escalated: false, confidence: "high" as const };
  return { escalated: false, confidence: "medium" as const };
}

// ── Retry con backoff exponencial ─────────────────────────
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
      const msg = err instanceof Error ? err.message : String(err);
      const isRetriable =
        msg.includes("429") || msg.includes("503") ||
        msg.includes("ResourceExhausted") || msg.includes("overloaded") ||
        msg.includes("Service Unavailable");

      if (isRetriable && attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(`[/api/query] Retry ${attempt}/${maxRetries} after ${delay}ms`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Se superó el número máximo de reintentos con Gemini.");
}

// ── ROUTE HANDLER PRINCIPAL ───────────────────────────────
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // ── 1. Cargar PDFs en caché (primera vez) ─────────────
    const pdfLoad = loadPDFsIntoCache();
    if (!pdfLoad.success) {
      console.error("[/api/query] PDFs no disponibles:", pdfLoad.error);
      // Continúa sin PDFs — degradación elegante
    }

    // ── 2. Parsear payload del cliente ────────────────────
    const body: QueryPayload = await req.json();
    const { queryText, queryType, sessionId, imageBase64, imageMimeType } = body;

    if (!queryText?.trim() && !imageBase64) {
      return NextResponse.json(
        { success: false, error: "La consulta no puede estar vacía." },
        { status: 400 }
      );
    }

    const queryFinal = queryText?.trim() || "(Consulta por imagen)";

    // ── 3. Construir partes del mensaje para Gemini ────────
    const userParts: Part[] = [];

    // Partes de texto de la consulta
    userParts.push({ text: `CONSULTA DEL OPERARIO: ${queryFinal}` });

    // ── 3a. PDFs del procedimiento como contexto nativo ────
    // Gemini lee TEXTO e IMÁGENES de los PDFs directamente.
    // Los PDFs NUNCA se envían al cliente — solo al modelo.
    const ragRefs: RagReference[] = [];

    if (pdfCache.loaded) {
      userParts.push({
        inlineData: {
          data: pdfCache.catheterStandards,
          mimeType: "application/pdf",
        },
      });
      userParts.push({
        inlineData: {
          data: pdfCache.hubAttachment,
          mimeType: "application/pdf",
        },
      });

      ragRefs.push(
        {
          section: "Documento completo",
          document: "Estándar Visual Final de Catéteres",
          excerpt: "Criterios de aceptación y rechazo para inspección visual de catéteres",
        },
        {
          section: "Documento completo",
          document: "Instrucción de Trabajo: Hub Bonding",
          excerpt: "Procedimiento de ensamble y adhesión del hub al catéter",
        }
      );

      userParts.push({
        text: "Usa ÚNICAMENTE el contenido de los dos documentos de procedimiento anteriores para responder la consulta del operario. Si la respuesta requiere referirse a una imagen específica del procedimiento, descríbela.",
      });
    } else {
      // Degradación elegante: sin PDFs disponibles
      userParts.push({
        text: "NOTA: Los archivos PDF de procedimiento no están disponibles en este momento. Indica al operario que escale al supervisor.",
      });
    }

    // ── 3b. Imagen del operario (EFÍMERA — NO se persiste) ─
    let hadImage = false;
    let imageDescription = "";

    if (imageBase64 && imageMimeType) {
      // El Buffer vive SOLO en memoria de este request
      // Node.js lo garbage-collect automáticamente al terminar
      userParts.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType as "image/jpeg" | "image/png" | "image/webp" | "image/heic",
        },
      });
      userParts.push({
        text: "El operario ha adjuntado una fotografía del defecto/componente. Analiza esta imagen usando los criterios de los procedimientos anteriores e indica si cumple o no con los criterios de aceptación.",
      });
      hadImage = true;
    }

    // ── 4. Llamar a Gemini con contexto completo ──────────
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.1, // Baja temperatura = respuestas más conservadoras y precisas
        maxOutputTokens: 1024,
      },
    });

    const contents: Content[] = [{ role: "user", parts: userParts }];
    const responseText = await callGeminiWithRetry(model, contents);

    // Extraer descripción del defecto si hay imagen
    if (hadImage) {
      imageDescription = responseText.slice(0, 250).replace(/\n/g, " ");
    }

    // ── 5. Evaluar si requiere escalación ─────────────────
    const { escalated, confidence } = evaluateEscalation(responseText, queryFinal);
    const processingTimeMs = Date.now() - startTime;

    // ── 6. Guardar Audit Log (SIN imágenes) ───────────────
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
        queryText: queryFinal,
        responseText,
        ragSourceRefs: ragRefs,
        hadImage,                        // ← Solo el FLAG booleano
        imageDescription,                // ← Solo descripción textual generada por IA
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
          queryText: queryFinal,
          aiResponse: responseText,
          status: "pending",
          priority: "normal",
          assignedSupervisorId: null,
          supervisorNotes: null,
        });
      }
    } catch (firestoreErr) {
      console.error("[/api/query] Firestore error:", firestoreErr);
    }

    // ── 7. Retornar respuesta al cliente ──────────────────
    // Los PDFs y la imagen del operario NO forman parte de la respuesta
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
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método no permitido." }, { status: 405 });
}
