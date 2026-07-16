"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  ChevronDown,
  RefreshCw,
  User,
  Loader2,
} from "lucide-react";
import { subscribeToEscalations, updateEscalationStatus } from "@/lib/firebase/firestore";
import { Escalation, EscalationStatus } from "@/types";
import { formatTimeAgo } from "@/lib/utils";

const STATUS_LABELS: Record<EscalationStatus, string> = {
  pending: "Pendiente",
  in_review: "En revisión",
  resolved: "Resuelto",
};

const STATUS_COLORS: Record<EscalationStatus, string> = {
  pending: "var(--danger)",
  in_review: "var(--warning)",
  resolved: "var(--success)",
};

export default function SupervisorPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [filter, setFilter] = useState<EscalationStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToEscalations(
      (data) => {
        setEscalations(data);
        setLoading(false);
      },
      filter === "all" ? undefined : filter
    );
    return unsub;
  }, [filter]);

  const handleUpdateStatus = useCallback(
    async (escalationId: string, newStatus: EscalationStatus) => {
      setActionLoading(escalationId);
      try {
        await updateEscalationStatus(escalationId, newStatus);
      } finally {
        setActionLoading(null);
      }
    },
    []
  );

  const filtered =
    filter === "all"
      ? escalations
      : escalations.filter((e) => e.status === filter);

  return (
    <div
      style={{
        flex: 1,
        padding: "24px",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Panel de Escalaciones
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Consultas fuera de alcance que requieren atención del supervisor
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12 }}>
          {(["pending", "in_review", "resolved"] as EscalationStatus[]).map(
            (s) => {
              const count = escalations.filter((e) => e.status === s).length;
              return (
                <div
                  key={s}
                  className="glass-card"
                  style={{
                    padding: "10px 16px",
                    textAlign: "center",
                    minWidth: 80,
                  }}
                >
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: STATUS_COLORS[s],
                    }}
                  >
                    {count}
                  </p>
                  <p style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                    {STATUS_LABELS[s]}
                  </p>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {(["all", "pending", "in_review", "resolved"] as const).map((f) => (
          <button
            key={f}
            type="button"
            id={`filter-${f}`}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 16px",
              borderRadius: 100,
              border:
                filter === f
                  ? "1px solid var(--brand-primary)"
                  : "1px solid var(--border-default)",
              background:
                filter === f ? "var(--brand-primary-muted)" : "var(--bg-elevated)",
              color: filter === f ? "var(--text-accent)" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: filter === f ? 600 : 400,
              transition: "all 0.15s ease",
            }}
          >
            {f === "all"
              ? `Todas (${escalations.length})`
              : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: 60,
            color: "var(--text-muted)",
          }}
        >
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          Cargando escalaciones...
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: 40,
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <CheckCircle
            size={40}
            color="var(--success)"
            style={{ margin: "0 auto 12px" }}
          />
          <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
            Sin escalaciones pendientes
          </p>
          <p style={{ fontSize: "0.8rem", marginTop: 4 }}>
            Todas las consultas están dentro del alcance del procedimiento.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((esc) => (
            <div
              key={esc.id}
              className="glass-card"
              style={{
                padding: "18px 20px",
                borderLeft: `4px solid ${STATUS_COLORS[esc.status]}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <AlertTriangle size={15} color={STATUS_COLORS[esc.status]} />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: STATUS_COLORS[esc.status],
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {STATUS_LABELS[esc.status]}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Clock size={11} />
                      {formatTimeAgo(esc.createdAt)}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <User size={11} />
                      {esc.userDisplayName} · Est. {esc.workstation}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-primary)",
                      fontWeight: 500,
                      marginBottom: 8,
                      wordBreak: "break-word",
                    }}
                  >
                    &quot;{esc.queryText}&quot;
                  </p>

                  {esc.aiResponse && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        wordBreak: "break-word",
                        lineHeight: 1.5,
                      }}
                    >
                      Resp. IA: {esc.aiResponse.slice(0, 150)}
                      {esc.aiResponse.length > 150 ? "..." : ""}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                {esc.status !== "resolved" && (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {esc.status === "pending" && (
                      <button
                        type="button"
                        id={`review-${esc.id}`}
                        onClick={() =>
                          handleUpdateStatus(esc.id!, "in_review")
                        }
                        disabled={actionLoading === esc.id}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--warning)",
                          background: "var(--warning-muted)",
                          color: "var(--warning)",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Eye size={13} />
                        En revisión
                      </button>
                    )}
                    <button
                      type="button"
                      id={`resolve-${esc.id}`}
                      onClick={() =>
                        handleUpdateStatus(esc.id!, "resolved")
                      }
                      disabled={actionLoading === esc.id}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--success)",
                        background: "var(--success-muted)",
                        color: "var(--success)",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {actionLoading === esc.id ? (
                        <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                      ) : (
                        <CheckCircle size={13} />
                      )}
                      Resolver
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
