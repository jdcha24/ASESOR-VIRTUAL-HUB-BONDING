// ============================================================
// TYPES — Asesor Digital de Calidad e Inspección
// Planta Manufactura Dispositivos Médicos | ISO 13485 / FDA
// ============================================================

// ── Roles de usuario ──────────────────────────────────────
export type UserRole = "operator" | "supervisor" | "quality_engineer";
export type Shift = "A" | "B" | "C";

// ── Usuario del sistema ───────────────────────────────────
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  employeeId: string;
  shift: Shift;
  workstation: string;
  createdAt: Date;
  lastLogin: Date;
}

// ── Tipos de consulta ──────────────────────────────────────
export type QueryType = "text" | "voice" | "image_analysis";
export type ConfidenceLevel = "high" | "medium" | "out_of_scope";

// ── Respuesta de la IA ─────────────────────────────────────
export interface AIQueryResponse {
  response: string;
  escalated: boolean;
  confidence: ConfidenceLevel;
  ragRefs: RagReference[];
  processingTimeMs: number;
  imageDescription?: string;
  logId?: string;
}

// ── Referencia a sección del procedimiento (RAG) ───────────
export interface RagReference {
  section: string;
  document: string;
  excerpt: string;
}

// ── Log de auditoría (Firestore: audit_logs) ───────────────
export interface AuditLog {
  id?: string;
  sessionId: string;
  userId: string;
  userRole: UserRole;
  employeeId: string;
  workstation: string;
  queryType: QueryType;
  queryText: string;
  responseText: string;
  ragSourceRefs: RagReference[];
  hadImage: boolean;
  imageDescription: string;
  escalated: boolean;
  escalationId: string | null;
  confidence: ConfidenceLevel;
  processingTimeMs: number;
  timestamp: Date;
}

// ── Escalación al supervisor (Firestore: escalations) ──────
export type EscalationStatus = "pending" | "in_review" | "resolved";
export type EscalationPriority = "normal" | "urgent";

export interface Escalation {
  id?: string;
  logId: string;
  userId: string;
  userDisplayName: string;
  employeeId: string;
  workstation: string;
  shift: Shift;
  queryText: string;
  aiResponse: string;
  status: EscalationStatus;
  priority: EscalationPriority;
  assignedSupervisorId: string | null;
  supervisorNotes: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
}

// ── Mensaje de chat (estado local, no persistido) ──────────
export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "sending" | "done" | "error" | "escalated";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp: Date;
  ragRefs?: RagReference[];
  confidence?: ConfidenceLevel;
  hadImage?: boolean;
  imagePreviewUrl?: string; // URL.createObjectURL — solo en cliente, efímera
  escalated?: boolean;
}

export interface HistoryMessage {
  role: "user" | "model";
  content: string;
}

// ── Payload enviado al Route Handler /api/query ────────────
export interface QueryPayload {
  queryText: string;
  queryType: QueryType;
  sessionId: string;
  imageBase64?: string;
  imageMimeType?: string;
  history?: HistoryMessage[];
}

// ── Chunk de base de conocimiento RAG ─────────────────────
export interface KnowledgeChunk {
  id: string;
  document: "CATHETER_VISUAL_STANDARDS" | "HUB_ATTACHMENT_WI";
  section: string;
  title: string;
  content: string;
  keywords: string[];
}

// ── Configuración del sistema (Firestore: system_config) ───
export interface SystemConfig {
  maxContextChunks: number;
  escalationKeywords: string[];
  modelId: string;
  updatedAt: Date;
}
