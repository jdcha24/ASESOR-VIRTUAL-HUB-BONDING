"use client";

import React from "react";
import { ChatMessage, RagReference } from "@/types";
import { formatTimestamp } from "@/lib/utils";
import { Bot, User, BookOpen, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

function RagRefBadge({ refs }: { refs: RagReference[] }) {
  if (!refs || refs.length === 0) return null;
  return (
    <div
      style={{
        marginTop: 10,
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
      }}
    >
      {refs.slice(0, 3).map((ref, i) => (
        <div
          key={i}
          title={ref.excerpt}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 100,
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.25)",
            fontSize: "0.7rem",
            color: "var(--text-accent)",
            cursor: "default",
          }}
        >
          <BookOpen size={10} />
          {ref.section}
        </div>
      ))}
    </div>
  );
}

function ConfidenceIcon({ confidence }: { confidence?: string }) {
  if (!confidence) return null;
  if (confidence === "high")
    return <CheckCircle size={13} color="var(--success)" aria-label="Alta confianza" />;
  if (confidence === "medium")
    return <AlertCircle size={13} color="var(--warning)" aria-label="Confianza media" />;
  return <XCircle size={13} color="var(--danger)" aria-label="Fuera de alcance" />;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div
        className="message-appear"
        style={{
          textAlign: "center",
          padding: "6px 16px",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
        }}
      >
        {message.content}
      </div>
    );
  }

  return (
    <div
      className="message-appear"
      style={{
        display: "flex",
        gap: 10,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        maxWidth: "100%",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: isUser
            ? "linear-gradient(135deg, #2563eb, #7c3aed)"
            : "linear-gradient(135deg, #0f172a, #1e293b)",
          border: isUser
            ? "none"
            : "1px solid var(--border-default)",
        }}
      >
        {isUser ? (
          <User size={18} color="white" />
        ) : (
          <Bot size={18} color="var(--text-accent)" />
        )}
      </div>

      {/* Bubble */}
      <div style={{ flex: 1, maxWidth: "85%" }}>
        <div
          style={{
            background: isUser
              ? "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)"
              : "var(--bg-card)",
            border: isUser
              ? "none"
              : message.escalated
              ? "1px solid rgba(239,68,68,0.4)"
              : "1px solid var(--border-subtle)",
            borderRadius: isUser
              ? "18px 4px 18px 18px"
              : "4px 18px 18px 18px",
            padding: "12px 16px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Image preview if present */}
          {message.imagePreviewUrl && (
            <div style={{ marginBottom: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.imagePreviewUrl}
                alt="Imagen adjunta"
                style={{
                  maxWidth: 160,
                  maxHeight: 120,
                  borderRadius: "var(--radius-sm)",
                  objectFit: "cover",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>
          )}

          {/* Message content */}
          {message.status === "sending" ? (
            <div style={{ display: "flex", gap: 4, alignItems: "center", height: 20 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="typing-dot"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--text-muted)",
                  }}
                />
              ))}
            </div>
          ) : (
            <p
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.65,
                color: isUser ? "rgba(255,255,255,0.95)" : "var(--text-primary)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {message.content}
            </p>
          )}

          {/* RAG references (only for assistant) */}
          {!isUser && message.ragRefs && message.status === "done" && (
            <RagRefBadge refs={message.ragRefs} />
          )}
        </div>

        {/* Footer metadata */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 4,
            padding: "0 4px",
            justifyContent: isUser ? "flex-end" : "flex-start",
          }}
        >
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            {formatTimestamp(message.timestamp)}
          </span>
          {!isUser && <ConfidenceIcon confidence={message.confidence} />}
          {message.hadImage && (
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
              📷 imagen analizada
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
