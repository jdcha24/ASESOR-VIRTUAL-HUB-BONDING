"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  UserPlus,
  Users,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { AppUser, UserRole, Shift } from "@/types";

export default function SettingsPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState<UserRole>("operator");
  const [shift, setShift] = useState<Shift>("A");
  const [workstation, setWorkstation] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      }));
      setUsersList(list);
    } catch (err: any) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setActionLoading(true);

    try {
      // Registrar usuario en la colección Firestore.
      // Cuando el usuario haga login, se asociará a este perfil
      await addDoc(collection(db, "users"), {
        uid: `auto_${Date.now()}`, // Identificador temporal hasta el primer login real
        email: email.toLowerCase().trim(),
        displayName: displayName.trim(),
        role,
        employeeId: employeeId.trim().toUpperCase(),
        shift,
        workstation: workstation.trim() || "Estación Estándar",
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      setSuccessMsg(`Usuario ${displayName} registrado exitosamente en Firestore.`);
      setEmail("");
      setDisplayName("");
      setEmployeeId("");
      setWorkstation("");
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(`Error al registrar usuario: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (docId: string, name: string) => {
    if (!confirm(`¿Está seguro de eliminar al usuario ${name}?`)) return;
    try {
      await deleteDoc(doc(db, "users", docId));
      setSuccessMsg("Usuario eliminado del listado.");
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        padding: "24px",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        background: "var(--bg-base)",
      }}
    >
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Settings size={24} color="var(--brand-primary)" />
          Configuración y Usuarios
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Control de accesos por roles, registro de personal de planta y parámetros.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--success-muted)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            fontSize: "0.85rem",
            color: "var(--success)",
          }}
        >
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--danger-muted)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            fontSize: "0.85rem",
            color: "var(--danger)",
          }}
        >
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
        }}
      >
        {/* ── SECCIÓN 1: REGISTRO DE USUARIOS ───────────── */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <UserPlus size={18} color="var(--text-accent)" />
            Registrar Nuevo Personal
          </h2>

          <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                Nombre Completo
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                placeholder="Nombre y Apellidos"
                className="industrial-input"
                disabled={actionLoading}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                ID de Empleado
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                placeholder="Ej: EMP-9820"
                className="industrial-input"
                disabled={actionLoading}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="usuario@empresa.com"
                className="industrial-input"
                disabled={actionLoading}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  Rol Asignado
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="industrial-input"
                  style={{ height: 44, padding: "8px 12px" }}
                  disabled={actionLoading}
                >
                  <option value="operator">Operario</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="quality_engineer">Calidad (Admin)</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  Turno
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as Shift)}
                  className="industrial-input"
                  style={{ height: 44, padding: "8px 12px" }}
                  disabled={actionLoading}
                >
                  <option value="A">Turno A</option>
                  <option value="B">Turno B</option>
                  <option value="C">Turno C</option>
                </select>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                Estación de Trabajo / Mesa
              </label>
              <input
                type="text"
                value={workstation}
                onChange={(e) => setWorkstation(e.target.value)}
                placeholder="Ej: Mesa de Curado UV 3"
                className="industrial-input"
                disabled={actionLoading}
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              style={{
                marginTop: 8,
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "linear-gradient(135deg, var(--brand-primary) 0%, #7c3aed 100%)",
                color: "white",
                fontWeight: 700,
                cursor: actionLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "var(--shadow-glow-blue)",
              }}
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Registrando...
                </>
              ) : (
                "Guardar Registro"
              )}
            </button>
          </form>
        </div>

        {/* ── SECCIÓN 2: LISTADO DE PERSONAL REGISTRADO ──── */}
        <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Users size={18} color="var(--text-accent)" />
            Personal Registrado ({usersList.length})
          </h2>

          {loading ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
              Cargando listado...
            </div>
          ) : usersList.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
              }}
            >
              No hay personal registrado en la base de datos.
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                maxHeight: 400,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {usersList.map((u) => (
                <div
                  key={u.id}
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {u.displayName}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                      {u.email} · <span style={{ fontWeight: 600 }}>{u.employeeId}</span>
                    </p>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <span
                        className={
                          u.role === "quality_engineer"
                            ? "badge-success"
                            : u.role === "supervisor"
                            ? "badge-warning"
                            : "badge-success"
                        }
                        style={{
                          fontSize: "0.6rem",
                          padding: "1px 6px",
                          background: u.role === "quality_engineer" ? "rgba(37,99,235,0.15)" : undefined,
                          color: u.role === "quality_engineer" ? "var(--text-accent)" : undefined,
                          borderColor: u.role === "quality_engineer" ? "rgba(37,99,235,0.3)" : undefined,
                        }}
                      >
                        {u.role === "quality_engineer"
                          ? "Calidad"
                          : u.role === "supervisor"
                          ? "Supervisor"
                          : "Operario"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.6rem",
                          padding: "1px 6px",
                          borderRadius: 100,
                          background: "var(--bg-input)",
                          border: "1px solid var(--border-default)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Turno {u.shift}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u.id, u.displayName)}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "none",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--danger)",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── PARÁMETROS GENERALES DEL RAG ────────────────── */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Shield size={18} color="var(--text-accent)" />
          Parámetros Críticos del Asesor IA
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <div style={{ background: "var(--bg-elevated)", padding: 16, borderRadius: "var(--radius-md)" }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Modelo Activo
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
              gemini-3-flash-preview (Multimodal)
            </p>
          </div>
          <div style={{ background: "var(--bg-elevated)", padding: 16, borderRadius: "var(--radius-md)" }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Temperatura RAG
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
              0.1 (Máxima precisión determinista)
            </p>
          </div>
          <div style={{ background: "var(--bg-elevated)", padding: 16, borderRadius: "var(--radius-md)" }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Base de Conocimiento
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
              Caché en RAM activa (Lectura nativa de 2 PDFs)
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
