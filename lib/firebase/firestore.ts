// ============================================================
// FIRESTORE CRUD HELPERS — Asesor Digital de Calidad
// ============================================================

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  AuditLog,
  Escalation,
  AppUser,
  EscalationStatus,
} from "@/types";

// ── USUARIOS ──────────────────────────────────────────────
export async function createUserProfile(user: Omit<AppUser, "createdAt" | "lastLogin">) {
  return addDoc(collection(db, "users"), {
    ...user,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });
}

export async function updateLastLogin(uid: string) {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const snap = await getDocs(q);
  if (!snap.empty) {
    await updateDoc(doc(db, "users", snap.docs[0].id), {
      lastLogin: serverTimestamp(),
    });
  }
}

// ── AUDIT LOGS ────────────────────────────────────────────
export async function saveAuditLog(
  log: Omit<AuditLog, "id" | "timestamp">
): Promise<string> {
  const docRef = await addDoc(collection(db, "audit_logs"), {
    ...log,
    // CRITICAL: Never persist image data — only flags and text descriptions
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAuditLogs(
  userId?: string,
  maxResults = 50
): Promise<AuditLog[]> {
  let q = query(
    collection(db, "audit_logs"),
    orderBy("timestamp", "desc"),
    limit(maxResults)
  );
  if (userId) {
    q = query(
      collection(db, "audit_logs"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(maxResults)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    timestamp: (d.data().timestamp as Timestamp)?.toDate() ?? new Date(),
  })) as AuditLog[];
}

// ── ESCALACIONES ──────────────────────────────────────────
export async function createEscalation(
  escalation: Omit<Escalation, "id" | "createdAt" | "resolvedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "escalations"), {
    ...escalation,
    resolvedAt: null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEscalationStatus(
  escalationId: string,
  status: EscalationStatus,
  supervisorNotes?: string,
  supervisorId?: string
) {
  const ref = doc(db, "escalations", escalationId);
  const updates: Record<string, unknown> = { status };
  if (supervisorNotes) updates.supervisorNotes = supervisorNotes;
  if (supervisorId) updates.assignedSupervisorId = supervisorId;
  if (status === "resolved") updates.resolvedAt = serverTimestamp();
  await updateDoc(ref, updates);
}

// ── LISTENER EN TIEMPO REAL para el Panel del Supervisor ─
export function subscribeToEscalations(
  onUpdate: (escalations: Escalation[]) => void,
  statusFilter?: EscalationStatus
) {
  const q = statusFilter
    ? query(
        collection(db, "escalations"),
        where("status", "==", statusFilter),
        orderBy("createdAt", "desc")
      )
    : query(
        collection(db, "escalations"),
        orderBy("createdAt", "desc"),
        limit(50)
      );

  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const escalations = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
      resolvedAt: d.data().resolvedAt
        ? (d.data().resolvedAt as Timestamp).toDate()
        : null,
    })) as Escalation[];
    onUpdate(escalations);
  });
}
