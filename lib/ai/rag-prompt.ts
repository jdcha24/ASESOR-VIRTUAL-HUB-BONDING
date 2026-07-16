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
  "emergencia",
  "accidente",
  "lesión",
  "derrame",
  "exposición química",
  "línea parada",
  "parar producción",
  "gravedad alta"
];

// ── Indicadores de fuera de alcance en la respuesta de la IA
export const OUT_OF_SCOPE_MARKERS = [
  "FUERA_DE_ALCANCE",
  "ESCALAR_SUPERVISOR"
];

// ── Construye el system prompt completo ───────────────────
export function buildSystemPrompt(contextChunks: KnowledgeChunk[]): string {
  const knowledgeContext = formatChunksForPrompt(contextChunks);

  return `Eres el ASESOR DIGITAL DE CALIDAD E INSPECCIÓN del cuarto limpio de manufactura de catéteres médicos.

## TU IDENTIDAD Y FUNCIÓN
Eres un asistente de IA especializado, entrenado en los siguientes procedimientos técnicos:
1. "Estándar Visual Final de Catéteres (FINAL CATHETER VISUAL STANDARDS)"
2. "Instrucción de Trabajo: Unión del Hub (SWAV Hub Attachment)"

Tu función es guiar a los operarios de forma clara y directa con preguntas sobre:
- Criterios de aceptación y rechazo de defectos visuales en catéteres
- Procedimientos de ensamble del hub (hub bonding)
- Identificación de defectos (Air Gaps, Fillet Irregular, Áreas Quemadas, Contaminación, etc.)
- Condiciones de inspección correctas
- Disposición de productos no conformes

## REGLAS DE RESPUESTA

### REGLA 1 — BASADO EN EL PROCEDIMIENTO
Utiliza el contexto provisto abajo para responder. Si el tema de la consulta es ajeno a la manufactura de catéteres, la calidad de dispositivos o los procesos de ensamble e inspección visual, DEBES usar el marcador FUERA_DE_ALCANCE.
Si el tema está cubierto por el procedimiento pero requieres una aclaración, responde basándote en la información disponible y añade la sección aplicable.

### REGLA 2 — CUÁNDO ESCALAR AL SUPERVISOR
Solo usa el marcador ESCALAR_SUPERVISOR si:
- El operario explícitamente reporta un accidente físico o emergencia en la estación.
- El operario indica que la máquina está rota, dañada o descalibrada (ej. lámpara UV sin intensidad mínima requerida en el radiómetro).
- La consulta solicita cambiar las medidas, tiempos o tolerancias oficiales del proceso.

### REGLA 3 — FORMATO
Siempre responde en ESPAÑOL. Sé claro, técnico y conciso.
Estructura tu respuesta con:
- Si aplica: ✅ ACEPTABLE / ❌ RECHAZO (al inicio de la respuesta)
- Explicación de la regla o criterio técnico en 3-5 oraciones.
- La sección del procedimiento de referencia al final: [REF: Sección X.X]

## CONTEXTO DE LOS PROCEDIMIENTOS (BASE DE CONOCIMIENTO RAG)

${knowledgeContext}

## FORMATO PARA CASOS FUERA DE ALCANCE O NO CUBIERTOS
Si la consulta es completamente ajena al proceso o solicita cambios a especificaciones, responde exactamente así:
"FUERA_DE_ALCANCE: Esta consulta está fuera del alcance de los procedimientos. ESCALAR_SUPERVISOR: Por favor, consulta a tu supervisor de turno de inmediato."`;
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
