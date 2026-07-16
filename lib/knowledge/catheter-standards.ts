// ============================================================
// BASE DE CONOCIMIENTO RAG — Asesor Digital de Calidad
// Fuente: FINAL CATHETER VISUAL STANDARDS + Hub Attachment WI
// NOTA: Este archivo contiene chunks de conocimiento extraídos
// de los procedimientos técnicos para RAG (Retrieval-Augmented
// Generation). Es la única fuente de verdad para la IA.
// ============================================================

import { KnowledgeChunk } from "@/types";

export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  // ═══════════════════════════════════════════════════════════
  // DOCUMENTO 1: FINAL CATHETER VISUAL STANDARDS
  // ═══════════════════════════════════════════════════════════
  {
    id: "CVS-001",
    document: "CATHETER_VISUAL_STANDARDS",
    section: "1.0 Propósito y Alcance",
    title: "Propósito del Estándar de Inspección Visual",
    content:
      "Este documento define los criterios de aceptación y rechazo para la inspección visual final de catéteres. Aplica a todos los operarios de inspección final y debe seguirse en su totalidad. El objetivo es garantizar que solo los productos que cumplan 100% con los criterios visuales sean liberados al cliente.",
    keywords: ["propósito", "alcance", "inspección visual", "criterios", "aceptación", "rechazo"],
  },
  {
    id: "CVS-002",
    document: "CATHETER_VISUAL_STANDARDS",
    section: "2.0 Defectos de Superficie — Quemado (Burned Areas)",
    title: "Áreas Quemadas — Criterios de Aceptación/Rechazo",
    content:
      "DEFECTO: Área Quemada (Burned Area). DESCRIPCIÓN: Decoloración o carbonización visible en la superficie del catéter o del hub, generalmente causada por exceso de calor durante el proceso de adhesión o ensamble. CRITERIO DE ACEPTACIÓN: No se acepta ningún grado de área quemada. Cualquier evidencia de quemado, sin importar su tamaño o extensión, es causa de RECHAZO AUTOMÁTICO del dispositivo. ACCIÓN: El dispositivo debe ser marcado como no conforme (NC) y segregado inmediatamente. No se reprocesa.",
    keywords: [
      "quemado",
      "burned",
      "área quemada",
      "decoloración",
      "carbonización",
      "rechazado",
      "no conforme",
      "calor excesivo",
    ],
  },
  {
    id: "CVS-003",
    document: "CATHETER_VISUAL_STANDARDS",
    section: "3.0 Defectos de Superficie — Contaminación",
    title: "Contaminación — Partículas y Contaminación Masiva",
    content:
      "DEFECTO: Contaminación. TIPOS: (a) Contaminación de partículas: presencia de partículas visibles (polvo, fibras, cabello, fragmentos de material) sobre la superficie del catéter. (b) Contaminación masiva: presencia de aceite, lubricante, grasa, adhesivo no curado u otras sustancias que cubran una área significativa del dispositivo. CRITERIO DE ACEPTACIÓN: (a) Partículas: Se acepta un máximo de 1 partícula de diámetro ≤ 0.5 mm en la zona no crítica del catéter. Cualquier partícula en la zona de punta o hub es RECHAZO. (b) Contaminación masiva: RECHAZO AUTOMÁTICO en cualquier zona del dispositivo. ACCIÓN: Para partículas aceptables, limpiar con paño libre de pelusas y alcohol IPA. Para contaminación masiva o rechazo, segregar como NC.",
    keywords: [
      "contaminación",
      "partículas",
      "contaminación masiva",
      "polvo",
      "fibras",
      "aceite",
      "grasa",
      "adhesivo",
      "limpieza",
      "IPA",
    ],
  },
  {
    id: "CVS-004",
    document: "CATHETER_VISUAL_STANDARDS",
    section: "4.0 Defectos de Adhesión — Air Gaps",
    title: "Air Gaps (Espacios de Aire) en la Unión Hub-Catéter",
    content:
      "DEFECTO: Air Gap. DESCRIPCIÓN: Espacio visible de aire entre el hub y el cuerpo del catéter en la zona de unión/adhesión. Indica una adhesión incompleta o falla en el proceso de bonding. TIPOS: (a) Air Gap periférico: espacio visible solo en un sector del perímetro de la unión. (b) Air Gap completo: espacio visible en todo el perímetro de la unión. CRITERIO DE ACEPTACIÓN: NO se acepta ningún Air Gap visible bajo inspección visual estándar (luz blanca, magnificación estándar). Cualquier Air Gap visible es RECHAZO AUTOMÁTICO. NOTA: La presencia de Air Gap puede indicar falla de adhesión estructural con implicaciones de biocompatibilidad y funcionalidad del dispositivo.",
    keywords: [
      "air gap",
      "espacio de aire",
      "adhesión",
      "bonding",
      "hub",
      "unión",
      "catéter",
      "rechazo",
      "incompleto",
    ],
  },
  {
    id: "CVS-005",
    document: "CATHETER_VISUAL_STANDARDS",
    section: "5.0 Defectos de Adhesión — Fillet Irregular",
    title: "Fillet Irregular en la Zona de Unión Hub-Catéter",
    content:
      "DEFECTO: Fillet Irregular. DESCRIPCIÓN: El 'fillet' es el cordón de adhesivo curado que forma el sello perimetral entre el hub y el tubo del catéter. Un fillet irregular presenta variaciones en su forma, grosor, continuidad o acabado. SUBTIPOS: (a) Fillet ausente: no hay cordón de adhesivo visible en algún sector. (b) Fillet discontinuo: el cordón presenta interrupciones o huecos. (c) Fillet excesivo: el adhesivo ha fluido más allá de la zona de bondeo, cubriendo áreas no designadas del catéter. (d) Fillet asimétrico: el grosor del cordón varía significativamente en el perímetro (diferencia > 50% del grosor nominal). CRITERIO DE ACEPTACIÓN: (a) Ausente: RECHAZO. (b) Discontinuo: RECHAZO si la interrupción supera 1 mm. (c) Excesivo: RECHAZO si el adhesivo cubre la zona de marcado o la punta del catéter. Acepta si solo es exceso menor en la base del hub. (d) Asimétrico: RECHAZO si la diferencia de grosor supera el 50% del nominal. ACCIÓN: Segregar como NC. No reprocesar.",
    keywords: [
      "fillet",
      "adhesivo",
      "cordón",
      "irregular",
      "ausente",
      "discontinuo",
      "excesivo",
      "asimétrico",
      "hub",
      "sello",
      "bonding",
    ],
  },
  {
    id: "CVS-006",
    document: "CATHETER_VISUAL_STANDARDS",
    section: "6.0 Inspección del Tubo del Catéter",
    title: "Inspección del Cuerpo del Tubo — Kinks, Torceduras y Deformaciones",
    content:
      "DEFECTO: Deformaciones del tubo. TIPOS: (a) Kink: pliegue o doblez brusco en el tubo del catéter. (b) Ovalización: sección transversal del tubo con forma ovalada en lugar de circular. (c) Aplastamiento: colapso parcial de la luz del tubo. CRITERIO DE ACEPTACIÓN: Cualquier kink visible es RECHAZO AUTOMÁTICO. La ovalización mayor al 10% del diámetro nominal es RECHAZO. El aplastamiento en cualquier grado es RECHAZO. PROCEDIMIENTO DE INSPECCIÓN: Rotar el catéter 360° bajo iluminación estándar para detectar deformaciones en todo el perímetro.",
    keywords: [
      "kink",
      "torcedura",
      "deformación",
      "ovalización",
      "aplastamiento",
      "tubo",
      "cuerpo",
      "doblez",
      "catéter",
    ],
  },
  {
    id: "CVS-007",
    document: "CATHETER_VISUAL_STANDARDS",
    section: "7.0 Inspección de la Punta del Catéter",
    title: "Inspección de la Punta Distal — Forma y Acabado",
    content:
      "DEFECTO: Defectos en la punta distal. DESCRIPCIÓN: La punta del catéter es la zona más crítica del dispositivo, ya que es el elemento que contacta el tejido del paciente. CRITERIOS: (a) La punta debe ser atraumática, con un acabado liso y redondeado, sin bordes cortantes ni rebabas. (b) No se acepta ninguna deformación visible de la punta. (c) No se acepta contaminación de ningún tipo en la zona de la punta. (d) No se aceptan marcas de mordidas de pinzas ni herramientas en la zona de punta. CRITERIO DE ACEPTACIÓN: Cualquier desviación de los criterios anteriores en la zona de punta es RECHAZO AUTOMÁTICO. La zona de punta se define como los últimos 5 mm del extremo distal del catéter.",
    keywords: [
      "punta",
      "distal",
      "atraumática",
      "rebaba",
      "borde cortante",
      "deformación",
      "zona crítica",
      "5 mm",
    ],
  },
  {
    id: "CVS-008",
    document: "CATHETER_VISUAL_STANDARDS",
    section: "8.0 Inspección del Hub",
    title: "Inspección Visual del Hub — Grietas, Marcado y Integridad",
    content:
      "DEFECTO: Defectos en el hub. TIPOS: (a) Grietas o fisuras: líneas de fractura visibles en el cuerpo del hub. (b) Marcado ilegible: el marcado de lote, referencia o fecha requerido es ilegible o está ausente. (c) Flash/exceso de material: exceso de material plástico en las líneas de partición del molde del hub. CRITERIO DE ACEPTACIÓN: (a) Grietas/fisuras: RECHAZO AUTOMÁTICO independientemente del tamaño. (b) Marcado ilegible/ausente: RECHAZO AUTOMÁTICO. (c) Flash: Se acepta flash menor a 0.3 mm de altura que no interfiera con el ensamble ni el marcado. Flash mayor es RECHAZO. ACCIÓN: Segregar como NC. No reprocesar.",
    keywords: [
      "hub",
      "grieta",
      "fisura",
      "marcado",
      "ilegible",
      "flash",
      "exceso de material",
      "lote",
      "referencia",
    ],
  },
  {
    id: "CVS-009",
    document: "CATHETER_VISUAL_STANDARDS",
    section: "9.0 Condiciones de Inspección",
    title: "Condiciones Estándar de Inspección Visual",
    content:
      "Las inspecciones visuales deben realizarse bajo las siguientes condiciones estándar: (a) ILUMINACIÓN: Iluminación blanca difusa de 1000-2000 lux sobre la superficie de inspección. (b) MAGNIFICACIÓN: Inspección a ojo desnudo o con lupa de 2x-4x para zonas críticas (punta y hub). (c) FONDO: Fondo negro mate para inspección de contaminación en superficies claras; fondo blanco para inspección de contaminación oscura o áreas quemadas. (d) TIEMPO DE INSPECCIÓN: Mínimo 15 segundos por dispositivo para inspección general. Zonas críticas (punta, unión hub) requieren un mínimo de 5 segundos adicionales cada una. (e) POSTURA: El inspector debe rotar el catéter 360° en al menos dos ángulos de visión.",
    keywords: [
      "condiciones",
      "iluminación",
      "magnificación",
      "lupa",
      "fondo",
      "tiempo",
      "360 grados",
      "inspección estándar",
    ],
  },
  {
    id: "CVS-010",
    document: "CATHETER_VISUAL_STANDARDS",
    section: "10.0 Disposición de No Conformes",
    title: "Procedimiento de Disposición de Productos No Conformes",
    content:
      "Todo dispositivo que no cumpla con los criterios de aceptación definidos en este estándar debe ser procesado de la siguiente manera: (1) IDENTIFICACIÓN: Colocar etiqueta roja de 'NO CONFORME' sobre el dispositivo o su bolsa. (2) SEGREGACIÓN: Colocar en el contenedor designado de No Conformes (contenedor rojo). (3) REGISTRO: Documentar en el sistema (SAP/MES) con: número de pieza, número de lote, estación de trabajo, descripción del defecto y código de defecto correspondiente. (4) ESCALACIÓN: Notificar al supervisor de turno cuando la tasa de NC supere el 3% de los dispositivos inspeccionados en una hora.",
    keywords: [
      "no conforme",
      "NC",
      "disposición",
      "etiqueta roja",
      "segregación",
      "registro",
      "SAP",
      "MES",
      "notificar",
      "supervisor",
      "3%",
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // DOCUMENTO 2: HUB ATTACHMENT WORK INSTRUCTION (SWAV)
  // ═══════════════════════════════════════════════════════════
  {
    id: "HA-001",
    document: "HUB_ATTACHMENT_WI",
    section: "1.0 Propósito y Alcance — Hub Attachment",
    title: "Propósito de la Instrucción de Trabajo: Unión del Hub",
    content:
      "Esta instrucción de trabajo (WI) describe el proceso de ensamble y adhesión (bonding) del hub al tubo del catéter. Es de cumplimiento obligatorio para todos los operarios de la estación de Hub Bonding. El objetivo es garantizar una unión estructural y hermética conforme a las especificaciones del diseño.",
    keywords: [
      "hub attachment",
      "instrucción de trabajo",
      "WI",
      "hub bonding",
      "ensamble",
      "adhesión",
      "proceso",
    ],
  },
  {
    id: "HA-002",
    document: "HUB_ATTACHMENT_WI",
    section: "2.0 Materiales y Herramientas Requeridas",
    title: "Materiales y Herramientas para Hub Bonding",
    content:
      "MATERIALES REQUERIDOS: (1) Catéter (tubo) pre-ensamblado y verificado. (2) Hub (componente plástico). (3) Adhesivo UV-curable [especificado en BOM — Bill of Materials del producto]. (4) Alcohol IPA al 70% para limpieza. (5) Paños libres de pelusas (lint-free wipes). HERRAMIENTAS REQUERIDAS: (1) Lámpara de curado UV con longitud de onda especificada en proceso. (2) Dispensador de adhesivo calibrado. (3) Fixture de alineación del hub. (4) Calibrador digital para verificación de inserción. (5) EPP: guantes de nitrilo, lentes de seguridad para UV. NOTA: Verificar vigencia de calibración de todos los equipos antes de iniciar el proceso.",
    keywords: [
      "materiales",
      "herramientas",
      "adhesivo",
      "UV",
      "IPA",
      "lint-free",
      "lámpara UV",
      "dispensador",
      "fixture",
      "calibrador",
      "EPP",
      "guantes",
    ],
  },
  {
    id: "HA-003",
    document: "HUB_ATTACHMENT_WI",
    section: "3.0 Preparación de Componentes",
    title: "Preparación y Limpieza de Componentes antes del Bonding",
    content:
      "PASO 1 — INSPECCIÓN DE COMPONENTES: Antes de iniciar el proceso de bonding, inspeccionar visualmente el hub y el tubo del catéter para detectar defectos preexistentes (grietas en hub, kinks en tubo, contaminación). Si se detecta algún defecto, no proceder con el ensamble y separar los componentes como NC. PASO 2 — LIMPIEZA: Limpiar la zona de inserción del tubo y la cavidad interna del hub con paño libre de pelusas embebido en IPA al 70%. Permitir secar completamente (mínimo 30 segundos) antes de aplicar adhesivo. PASO 3 — VERIFICACIÓN DE MEDIDAS: Medir con calibrador digital la profundidad de inserción del tubo en el hub según la especificación del plano del producto (típicamente X ± 0.5 mm). Documentar la medición.",
    keywords: [
      "preparación",
      "limpieza",
      "inspección previa",
      "IPA",
      "profundidad de inserción",
      "calibrador",
      "medición",
      "30 segundos",
      "secar",
    ],
  },
  {
    id: "HA-004",
    document: "HUB_ATTACHMENT_WI",
    section: "4.0 Aplicación de Adhesivo",
    title: "Procedimiento de Aplicación del Adhesivo UV",
    content:
      "PASO 4 — APLICACIÓN DE ADHESIVO: Aplicar el adhesivo UV usando el dispensador calibrado en la zona perimetral de la cavidad del hub, siguiendo el patrón de aplicación indicado en la hoja de proceso (típicamente: aplicación circular completa en la base de la cavidad). CANTIDAD: La cantidad de adhesivo debe ser suficiente para formar un fillet continuo y uniforme al insertar el tubo, sin exceder la cantidad que pueda fluir hacia el lumen del catéter o hacia el exterior del hub más allá de la zona de bondeo. PRECAUCIÓN: El adhesivo UV-curable es sensible a la luz ambiental. No exponer a luz directa por más de 2 minutos antes del curado. Mantener tapado cuando no esté en uso. TEMPERATURA: Verificar que los componentes estén a temperatura ambiente (18-25°C) antes de la aplicación.",
    keywords: [
      "adhesivo",
      "aplicación",
      "dispensador",
      "circular",
      "fillet",
      "cantidad",
      "lumen",
      "UV",
      "luz ambiental",
      "2 minutos",
      "temperatura",
      "18-25°C",
    ],
  },
  {
    id: "HA-005",
    document: "HUB_ATTACHMENT_WI",
    section: "5.0 Inserción y Alineación del Hub",
    title: "Inserción del Hub y Alineación con Fixture",
    content:
      "PASO 5 — INSERCIÓN DEL HUB: Insertar el tubo del catéter en la cavidad del hub hasta la profundidad de inserción especificada, utilizando el fixture de alineación para garantizar la perpendicularidad del ensamble. La inserción debe ser firme y continua, sin movimientos laterales que puedan desplazar el adhesivo de manera no uniforme. VERIFICACIÓN DE INSERCIÓN: Confirmar visualmente que el tubo haya alcanzado la marca de profundidad. ALINEACIÓN: El eje del hub y el eje del catéter deben ser colineales (desalineación máxima permitida: ≤ 2°). Una desalineación mayor debe corregirse antes de proceder con el curado, o descartar si el adhesivo ya comenzó a fluir.",
    keywords: [
      "inserción",
      "hub",
      "fixture",
      "alineación",
      "profundidad",
      "perpendicularidad",
      "colineal",
      "2 grados",
      "desalineación",
    ],
  },
  {
    id: "HA-006",
    document: "HUB_ATTACHMENT_WI",
    section: "6.0 Curado UV",
    title: "Proceso de Curado con Lámpara UV",
    content:
      "PASO 6 — CURADO UV: Una vez el ensamble hub-catéter esté correctamente posicionado en el fixture, proceder con el curado UV siguiendo los parámetros de proceso: (a) TIEMPO DE EXPOSICIÓN: El tiempo de curado debe seguir los parámetros del proceso validado para cada referencia de producto (típicamente entre 10-30 segundos de exposición directa). (b) DISTANCIA: Mantener la lámpara a la distancia especificada en el proceso (típicamente 5-10 mm de la zona de bondeo). (c) VERIFICACIÓN DE LA LÁMPARA: Antes de cada turno, verificar la intensidad de la lámpara UV con el medidor de intensidad (radiometro). La intensidad mínima aceptable es la especificada en el registro de proceso. Si la lámpara no cumple la intensidad mínima, detener el proceso y notificar al supervisor. (d) EXPOSICIÓN COMPLETA: Rotar el ensamble para garantizar exposición UV en el 100% del perímetro del fillet.",
    keywords: [
      "curado UV",
      "lámpara",
      "tiempo de exposición",
      "distancia",
      "radiometro",
      "intensidad",
      "10-30 segundos",
      "5-10 mm",
      "perímetro",
      "rotación",
    ],
  },
  {
    id: "HA-007",
    document: "HUB_ATTACHMENT_WI",
    section: "7.0 Inspección Post-Curado",
    title: "Inspección Visual Post-Curado del Ensamble Hub-Catéter",
    content:
      "PASO 7 — INSPECCIÓN POST-CURADO: Inmediatamente después del curado, realizar la inspección visual del ensamble antes de retirar del fixture. VERIFICACIONES: (1) Fillet: Verificar que el fillet sea continuo, uniforme y esté presente en el 100% del perímetro de la unión. (2) Air Gaps: Inspeccionar visualmente para detectar cualquier espacio de aire en la interfaz hub-tubo. (3) Adhesivo excesivo: Verificar que no haya flujo de adhesivo hacia el lumen del catéter ni hacia zonas prohibidas del hub. (4) Alineación final: Confirmar que el eje del hub y del catéter sean colineales. (5) Quemado: Verificar que la exposición UV no haya generado decoloración o daño térmico visible. CRITERIO: Cualquier no conformidad en estos puntos resulta en RECHAZO del ensamble. Seguir el procedimiento de disposición de NC.",
    keywords: [
      "inspección post-curado",
      "fillet",
      "air gap",
      "adhesivo excesivo",
      "lumen",
      "alineación",
      "quemado",
      "UV",
      "ensamble",
      "perímetro",
    ],
  },
  {
    id: "HA-008",
    document: "HUB_ATTACHMENT_WI",
    section: "8.0 Prueba de Pull-Off (Adherencia)",
    title: "Prueba de Adherencia Pull-Off — Frecuencia y Criterios",
    content:
      "PRUEBA DE PULL-OFF: La resistencia de la unión hub-catéter debe verificarse mediante la prueba de pull-off según la frecuencia establecida en el plan de control. FRECUENCIA: El primer y último ensamble de cada lote de producción, y cada hora de producción continua, deben ser sometidos a la prueba de pull-off. MÉTODO: Sujetar el hub y el tubo en las mordazas del equipo de prueba (tensiómetro). Aplicar fuerza de tracción axial a una velocidad controlada de [especificada en proceso]. CRITERIO DE ACEPTACIÓN: La unión debe soportar una fuerza mínima de [valor especificado en el plano del producto] sin separación, deslizamiento del tubo en el hub, ni fractura del hub. REGISTRO: Documentar resultado (fuerza máxima aplicada, ¿pasó/falló?) en el registro de proceso. Cualquier falla en la prueba requiere revisión y potencial retención del lote producido. Notificar al supervisor inmediatamente.",
    keywords: [
      "pull-off",
      "adherencia",
      "prueba",
      "tensiómetro",
      "fuerza",
      "tracción",
      "lote",
      "frecuencia",
      "registro",
      "retención",
      "supervisor",
    ],
  },
  {
    id: "HA-009",
    document: "HUB_ATTACHMENT_WI",
    section: "9.0 Parámetros Críticos de Proceso (CPP)",
    title: "Parámetros Críticos del Proceso de Hub Bonding",
    content:
      "PARÁMETROS CRÍTICOS DE PROCESO (CPP): Los siguientes parámetros son críticos y deben monitorearse y documentarse en cada turno: (1) Intensidad de la lámpara UV (verificar con radiómetro antes de cada turno). (2) Profundidad de inserción del tubo en el hub (verificar con calibrador digital). (3) Cantidad de adhesivo aplicado (verificar mediante peso o inspección visual del fillet post-curado). (4) Temperatura ambiente de la sala (rango aceptable: 18-25°C). (5) Tiempo de curado UV (cronometrado por el sistema de la lámpara o manualmente). CONTROL: Si cualquier CPP está fuera de especificación, detener la producción, separar los dispositivos producidos mientras el CPP estaba fuera de spec, y notificar al supervisor e Ingeniería de Proceso. NO continuar producción hasta que el CPP sea corregido y documentado.",
    keywords: [
      "CPP",
      "parámetros críticos",
      "intensidad UV",
      "profundidad inserción",
      "adhesivo",
      "temperatura",
      "tiempo curado",
      "fuera de especificación",
      "detener producción",
      "supervisor",
      "ingeniería",
    ],
  },
  {
    id: "HA-010",
    document: "HUB_ATTACHMENT_WI",
    section: "10.0 Seguridad y EPP",
    title: "Seguridad — Equipo de Protección Personal para Hub Bonding",
    content:
      "SEGURIDAD EN EL PROCESO DE HUB BONDING: (1) GUANTES: Usar siempre guantes de nitrilo durante la manipulación del adhesivo UV-curable. El adhesivo puede causar sensibilización de la piel por contacto repetido. (2) PROTECCIÓN OCULAR: Usar lentes de seguridad con protección UV durante la operación de la lámpara UV. Nunca mirar directamente a la fuente de luz UV. (3) VENTILACIÓN: Asegurarse de que el área de trabajo tenga ventilación adecuada. Los adhesivos UV-curables pueden emitir vapores irritantes antes del curado. (4) PRIMEROS AUXILIOS: En caso de contacto del adhesivo con piel u ojos, lavar inmediatamente con abundante agua y reportar al departamento médico de la planta. (5) MSDS: Consultar la Hoja de Seguridad del Material (MSDS/SDS) del adhesivo antes de manipularlo.",
    keywords: [
      "seguridad",
      "EPP",
      "guantes",
      "nitrilo",
      "lentes UV",
      "protección ocular",
      "ventilación",
      "adhesivo",
      "vapores",
      "primeros auxilios",
      "MSDS",
      "SDS",
    ],
  },
];

// ── Función de recuperación RAG ────────────────────────────
/**
 * Recupera los chunks más relevantes de la base de conocimiento
 * para una consulta dada, usando coincidencia de palabras clave.
 * En producción esto puede reemplazarse por embeddings vectoriales.
 */
export function retrieveRelevantChunks(
  query: string,
  maxChunks: number = 5
): KnowledgeChunk[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const scored = KNOWLEDGE_BASE.map((chunk) => {
    let score = 0;
    // Coincidencia de palabras clave
    for (const keyword of chunk.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 3;
      }
    }
    // Coincidencia de palabras del query en título/sección
    for (const word of queryWords) {
      if (chunk.title.toLowerCase().includes(word)) score += 2;
      if (chunk.section.toLowerCase().includes(word)) score += 1;
      if (chunk.content.toLowerCase().includes(word)) score += 1;
    }
    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map((s) => s.chunk);
}

// ── Función para formatear chunks como contexto de prompt ──
export function formatChunksForPrompt(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) {
    return "No se encontraron secciones relevantes en el procedimiento para esta consulta.";
  }

  return chunks
    .map(
      (c, i) =>
        `--- FUENTE ${i + 1}: [${c.document === "CATHETER_VISUAL_STANDARDS" ? "Estándar Visual de Catéteres" : "Instrucción de Trabajo: Hub Bonding"}] | Sección: ${c.section} ---\n${c.content}`
    )
    .join("\n\n");
}
