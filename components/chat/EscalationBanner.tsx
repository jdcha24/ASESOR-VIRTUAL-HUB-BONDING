"use client";

import React from "react";
import { AlertTriangle, PhoneCall, X } from "lucide-react";

interface EscalationBannerProps {
  visible: boolean;
  onDismiss?: () => void;
  queryText?: string;
}

export function EscalationBanner({
  visible,
  onDismiss,
  queryText,
}: EscalationBannerProps) {
  if (!visible) return null;

  return (
    <div
      id="escalation-banner"
      role="alert"
      aria-live="assertive"
      className="escalation-banner"
      style={{
        background: "linear-gradient(135deg, rgba(127,29,29,0.95) 0%, rgba(153,27,27,0.95) 100%)",
        border: "2px solid var(--danger)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        position: "relative",
        backdropFilter: "blur(8px)",
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.25)",
            border: "2px solid var(--danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={22} color="var(--danger)" />
        </div>

        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fca5a5",
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ⚠ Consulta Fuera de Alcance — Escalar al Supervisor
          </p>
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(252,165,165,0.85)",
              lineHeight: 1.5,
            }}
          >
            Esta consulta no pudo resolverse únicamente con los procedimientos disponibles.{" "}
            <strong>Contacta a tu supervisor de turno de inmediato.</strong>
          </p>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            title="Cerrar alerta"
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "var(--radius-sm)",
              color: "#fca5a5",
              cursor: "pointer",
              padding: "4px 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Query reminder */}
      {queryText && (
        <div
          style={{
            background: "rgba(0,0,0,0.25)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 12px",
            fontSize: "0.8rem",
            color: "rgba(252,165,165,0.75)",
            fontStyle: "italic",
          }}
        >
          Consulta: &quot;{queryText.slice(0, 100)}{queryText.length > 100 ? "..." : ""}&quot;
        </div>
      )}

      {/* Action CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.35)",
          borderRadius: "var(--radius-md)",
          padding: "10px 16px",
        }}
      >
        <PhoneCall size={18} color="#fca5a5" />
        <div>
          <p style={{ fontSize: "0.75rem", color: "#fca5a5", fontWeight: 600 }}>
            ACCIÓN REQUERIDA
          </p>
          <p style={{ fontSize: "0.8rem", color: "rgba(252,165,165,0.8)" }}>
            Detén el proceso y notifica al supervisor de turno. La escalación ha sido registrada automáticamente en el sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
