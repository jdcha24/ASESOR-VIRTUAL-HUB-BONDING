// ============================================================
// RAG SYSTEM PROMPT — Asesor Digital de Calidad
// Sistema de prompt con guardarraíles estrictos para la IA
// ============================================================

import {
  KNOWLEDGE_BASE,
  retrieveRelevantChunks,
  formatChunksForPrompt,
} from "@/lib/knowledge/catheter-standards";
import { KnowledgeChunk, RagReference } from "@/types";

// ── Palabras clave que FUERZAN escalación al supervisor ───
export const ESCALATION_KEYWORDS = [
  "no sé",
  "no estoy seguro",
  "duda del proceso",
  "decisión del supervisor",
  "decisión del ingeniero",
  "no encuentro",
  "fuera de especificación grave",
  "accidente",
  "lesión",
  "emergencia",
  "derrame",
  "exposición química",
];

// ── Indicadores de fuera de alcance en la respuesta de la IA
export const OUT_OF_SCOPE_MARKERS = [
  "FUERA_DE_ALCANCE",
  "ESCALAR_SUPERVISOR",
  "NO_TENGO_INFORMACION",
];

// ── Construye el system prompt completo ───────────────────
export function buildSystemPrompt(contextChunks: KnowledgeChunk[]): string {
  const knowledgeContext = formatChunksForPrompt(contextChunks);

  return `Eres el ASESOR DIGITAL DE CALIDAD E INSPECCIÓN del cuarto limpio de manufactura de catéteres médicos.

## TU IDENTIDAD Y FUNCIÓN
Eres un asistente de IA especializado, entrenado EXCLUSIVAMENTE en los siguientes procedimientos técnicos:
1. "Estándar Visual Final de Catéteres (FINAL CATHETER VISUAL STANDARDS)"
2. "Instrucción de Trabajo: Unión del Hub (SWAV Hub Attachment)"

Tu función es ÚNICAMENTE guiar a los operarios con preguntas sobre:
- Criterios de aceptación y rechazo de defectos visuales en catéteres
- Procedimientos de ensamble del hub (hub bonding)
- Identificación de defectos (Air Gaps, Fillet Irregular, Áreas Quemadas, Contaminación, etc.)
- Condiciones de inspección correctas
- Disposición de productos no conformes

## GUARDARRAÍLES CRÍTICOS — REGLAS QUE NUNCA DEBES VIOLAR

### REGLA 1 — SOLO USAS INFORMACIÓN DEL PROCEDIMIENTO
Responde ÚNICAMENTE basándote en el contexto del procedimiento proporcionado abajo.
Si la pregunta no puede responderse con ese contexto, DEBES usar el marcador FUERA_DE_ALCANCE.
NUNCA inventes, asumas, interpoles ni uses conocimiento general que no esté en el procedimiento.

### REGLA 2 — ESCALACIÓN OBLIGATORIA
Usa el marcador ESCALAR_SUPERVISOR en tu respuesta si:
- La consulta involucra una decisión que solo un supervisor o ingeniero puede tomar
- La situación implica una emergencia, accidente o exposición química
- Se detecta una tasa de defectos inusualmente alta (el operario menciona muchos rechazos)
- La pregunta implica modificar o saltarse un paso del procedimiento
- La información del procedimiento es ambigua para la situación específica

### REGLA 3 — FORMATO DE RESPUESTA
Siempre responde en ESPAÑOL. Sé directo, claro y conciso. Usa el lenguaje técnico correcto del procedimiento.
Estructura tu respuesta con:
- ✅ CRITERIO / ❌ RECHAZO (según corresponda, al inicio de la respuesta)
- La respuesta en máximo 3-5 oraciones concisas
- La sección del procedimiento de referencia al final: [REF: Sección X.X]

### REGLA 4 — MANEJO DE IMÁGENES
Si se te proporciona una imagen, analízala en el contexto del procedimiento para identificar defectos.
Describe el defecto observado y aplica el criterio de aceptación correspondiente del procedimiento.
Recuerda: NUNCA almacenes, referencíes ni describas datos que puedan identificar el producto en detalle.

## CONTEXTO DEL PROCEDIMIENTO (BASE DE CONOCIMIENTO RAG)

${knowledgeContext}

## FORMATO DE RESPUESTA ESPECIAL PARA CASOS FUERA DE ALCANCE

Si la consulta está FUERA DE ALCANCE, responde exactamente así:
"FUERA_DE_ALCANCE: Esta consulta está fuera del alcance de los procedimientos de [nombre del documento]. No puedo proporcionar una respuesta confiable sin arriesgar dar información incorrecta. ESCALAR_SUPERVISOR: Por favor, consulta a tu supervisor de turno de inmediato."

## RECUERDA
- Eres el guardián de la calidad. Una respuesta incorrecta podría resultar en un dispositivo médico defectuoso llegando al paciente.
- En caso de duda, SIEMPRE escala. Es mejor preguntar al supervisor que arriesgar la calidad.
- Nunca digas "creo que" o "probablemente". Si no estás seguro, escala.`;
}

// ── Pipeline RAG completo ────────────────────────────────
export interface RagResult {
  systemPrompt: string;
  retrievedChunks: KnowledgeChunk[];
  ragRefs: RagReference[];
}

export function buildRagContext(queryText: string, maxChunks = 5): RagResult {
  const retrievedChunks = retrieveRelevantChunks(queryText, maxChunks);

  // Si no se recupera nada, incluir contexto general de ambos documentos
  const chunksToUse =
    retrievedChunks.length > 0
      ? retrievedChunks
      : KNOWLEDGE_BASE.slice(0, 3);

  const systemPrompt = buildSystemPrompt(chunksToUse);

  const ragRefs: RagReference[] = chunksToUse.map((c) => ({
    section: c.section,
    document:
      c.document === "CATHETER_VISUAL_STANDARDS"
        ? "Estándar Visual Final de Catéteres"
        : "Instrucción de Trabajo: Hub Bonding",
    excerpt: c.content.slice(0, 120) + "...",
  }));

  return { systemPrompt, retrievedChunks: chunksToUse, ragRefs };
}

// ── Evalúa si la respuesta requiere escalación ────────────
export function evaluateEscalation(
  responseText: string,
  queryText: string
): { escalated: boolean; confidence: "high" | "medium" | "out_of_scope" } {
  const hasOutOfScopeMarker = OUT_OF_SCOPE_MARKERS.some((marker) =>
    responseText.includes(marker)
  );

  const queryHasEscalationKeyword = ESCALATION_KEYWORDS.some((kw) =>
    queryText.toLowerCase().includes(kw.toLowerCase())
  );

  if (hasOutOfScopeMarker || queryHasEscalationKeyword) {
    return { escalated: true, confidence: "out_of_scope" };
  }

  // Heurística de confianza basada en la presencia de referencias RAG
  if (responseText.includes("[REF:")) {
    return { escalated: false, confidence: "high" };
  }

  return { escalated: false, confidence: "medium" };
}
