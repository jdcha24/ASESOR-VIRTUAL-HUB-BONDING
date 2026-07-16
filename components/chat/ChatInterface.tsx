"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Send,
  Shield,
  Zap,
  ClipboardList,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { ChatMessage, AIQueryResponse, QueryType } from "@/types";
import { generateMessageId, generateSessionId } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";
import { VoiceInput } from "./VoiceInput";
import { ImageUploader } from "./ImageUploader";
import { EscalationBanner } from "./EscalationBanner";

// ── Sugerencias de consultas frecuentes ──────────────────
const QUICK_PROMPTS = [
  "¿Qué es un Air Gap y cuál es el criterio de aceptación?",
  "Encontré un fillet discontinuo, ¿lo acepto o lo rechazo?",
  "¿Cuáles son los pasos para limpiar antes del bonding?",
  "Vi un área quemada pequeña, ¿qué hago?",
  "¿Cuánto tiempo debe durar el curado UV?",
  "¿Cómo inspecciono la punta del catéter correctamente?",
];

const SESSION_ID = generateSessionId();

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateMessageId(),
      role: "assistant",
      content:
        "¡Bienvenido al Asesor Digital de Calidad! 👋\n\nSoy tu asistente especializado en inspección visual de catéteres y el proceso de Hub Bonding. Puedo ayudarte con:\n\n• Criterios de aceptación y rechazo de defectos\n• Pasos del procedimiento de Hub Bonding\n• Identificación de defectos (Air Gaps, Fillet Irregular, Áreas Quemadas, etc.)\n• Condiciones correctas de inspección\n\nPuedes escribir, usar el micrófono 🎤 o cargar una foto 📷 del defecto. ¿En qué puedo ayudarte?",
      status: "done",
      timestamp: new Date(),
      confidence: "high",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [escalationVisible, setEscalationVisible] = useState(false);
  const [lastEscalatedQuery, setLastEscalatedQuery] = useState<string>("");
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "instant",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Detectar si el usuario ha scrolled hacia arriba
  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollDown(!isNearBottom);
  }, []);

  // Enviar consulta
  const handleSend = useCallback(
    async (overrideText?: string, overrideType?: QueryType) => {
      const text = (overrideText ?? inputText).trim();
      if (!text && !imageBase64) return;
      if (isSending) return;

      const queryText = text || "(Consulta por imagen)";
      const queryType: QueryType =
        overrideType ??
        (imageBase64 ? "image_analysis" : "text");

      // Agregar mensaje del usuario
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: "user",
        content: queryText,
        status: "done",
        timestamp: new Date(),
        hadImage: !!imageBase64,
        imagePreviewUrl: imagePreviewUrl ?? undefined,
      };

      // Agregar placeholder de respuesta con typing indicator
      const aiPlaceholderId = generateMessageId();
      const aiPlaceholder: ChatMessage = {
        id: aiPlaceholderId,
        role: "assistant",
        content: "",
        status: "sending",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, aiPlaceholder]);
      setInputText("");
      setEscalationVisible(false);
      setIsSending(true);

      // Guardar y limpiar imagen del estado
      const base64ToSend = imageBase64;
      const mimeToSend = imageMimeType;
      const previewSnapshot = imagePreviewUrl;
      setImageBase64(null);
      setImageMimeType(null);
      setImagePreviewUrl(null);

      try {
        const res = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            queryText,
            queryType,
            sessionId: SESSION_ID,
            imageBase64: base64ToSend ?? undefined,
            imageMimeType: mimeToSend ?? undefined,
          }),
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error ?? "Error desconocido del servidor.");
        }

        const aiData: AIQueryResponse = json.data;

        // Actualizar el mensaje placeholder con la respuesta real
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiPlaceholderId
              ? {
                  ...m,
                  content: aiData.response,
                  status: aiData.escalated ? "escalated" : "done",
                  ragRefs: aiData.ragRefs,
                  confidence: aiData.confidence,
                  escalated: aiData.escalated,
                  hadImage: !!base64ToSend,
                  imagePreviewUrl: previewSnapshot ?? undefined,
                }
              : m
          )
        );

        // Mostrar banner de escalación si corresponde
        if (aiData.escalated) {
          setEscalationVisible(true);
          setLastEscalatedQuery(queryText);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Error de conexión.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiPlaceholderId
              ? {
                  ...m,
                  content: `⚠️ Error al procesar la consulta: ${errorMessage}. Inténtalo de nuevo o consulta al supervisor.`,
                  status: "error",
                }
              : m
          )
        );
      } finally {
        setIsSending(false);
        inputRef.current?.focus();
      }
    },
    [inputText, imageBase64, imageMimeType, imagePreviewUrl, isSending]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleVoiceTranscript = useCallback(
    (transcript: string) => {
      setInputText(transcript);
      // Auto-enviar si hay transcripción
      setTimeout(() => handleSend(transcript, "voice"), 300);
    },
    [handleSend]
  );

  const handleQuickPrompt = useCallback(
    (prompt: string) => {
      setInputText(prompt);
      handleSend(prompt, "text");
    },
    [handleSend]
  );

  const handleClearSession = useCallback(() => {
    setMessages([
      {
        id: generateMessageId(),
        role: "assistant",
        content:
          "Sesión reiniciada. ¿En qué puedo ayudarte con el proceso de inspección o Hub Bonding?",
        status: "done",
        timestamp: new Date(),
        confidence: "high",
      },
    ]);
    setEscalationVisible(false);
    setImageBase64(null);
    setImageMimeType(null);
    setImagePreviewUrl(null);
    setInputText("");
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* ── HEADER ─────────────────────────────────────── */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-elevated)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-glow-blue)",
            }}
          >
            <Shield size={22} color="white" />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              Asesor de Calidad
            </h1>
            <p
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Zap size={10} color="var(--success)" />
              Hub Bonding & Inspección Visual · ISO 13485
            </p>
          </div>
        </div>

        <button
          id="clear-session-btn"
          type="button"
          onClick={handleClearSession}
          title="Nueva sesión"
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "6px 10px",
            fontSize: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s ease",
          }}
        >
          <RefreshCw size={13} />
          Nueva sesión
        </button>
      </div>

      {/* ── ESCALATION BANNER ──────────────────────────── */}
      {escalationVisible && (
        <div style={{ padding: "12px 16px", flexShrink: 0 }}>
          <EscalationBanner
            visible={escalationVisible}
            onDismiss={() => setEscalationVisible(false)}
            queryText={lastEscalatedQuery}
          />
        </div>
      )}

      {/* ── QUICK PROMPTS ──────────────────────────────── */}
      {messages.length <= 1 && (
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border-subtle)",
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ClipboardList size={11} />
            Consultas frecuentes
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                id={`quick-prompt-${i}`}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isSending}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 100,
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  padding: "5px 12px",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── CHAT MESSAGES ──────────────────────────────── */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          position: "relative",
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollDown && (
        <button
          type="button"
          onClick={() => scrollToBottom()}
          title="Ir al último mensaje"
          style={{
            position: "absolute",
            bottom: 90,
            right: 24,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--brand-primary)",
            border: "none",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-glow-blue)",
            zIndex: 10,
          }}
        >
          <ChevronDown size={18} />
        </button>
      )}

      {/* ── INPUT AREA ─────────────────────────────────── */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-elevated)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            background: "var(--bg-input)",
            border: "1.5px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            padding: "10px 12px",
            transition: "border-color 0.15s ease",
          }}
        >
          {/* Image uploader */}
          <div style={{ position: "relative" }}>
            <ImageUploader
              onImageSelected={(b64, mime, preview) => {
                setImageBase64(b64);
                setImageMimeType(mime);
                setImagePreviewUrl(preview);
              }}
              onImageCleared={() => {
                setImageBase64(null);
                setImageMimeType(null);
                setImagePreviewUrl(null);
              }}
              previewUrl={imagePreviewUrl}
              disabled={isSending}
            />
          </div>

          {/* Text input */}
          <textarea
            ref={inputRef}
            id="chat-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              imageBase64
                ? "Describe el defecto o presiona Enviar para analizar la imagen..."
                : "Escribe tu consulta o usa el micrófono..."
            }
            disabled={isSending}
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              fontFamily: "var(--font-sans)",
              resize: "none",
              maxHeight: 120,
              lineHeight: 1.5,
              overflowY: "auto",
              padding: "2px 0",
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />

          {/* Voice input */}
          <div style={{ position: "relative" }}>
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              disabled={isSending}
            />
          </div>

          {/* Send button */}
          <button
            id="send-btn"
            type="button"
            onClick={() => handleSend()}
            disabled={isSending || (!inputText.trim() && !imageBase64)}
            style={{
              width: 42,
              height: 42,
              borderRadius: "var(--radius-md)",
              border: "none",
              background:
                isSending || (!inputText.trim() && !imageBase64)
                  ? "var(--bg-elevated)"
                  : "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              color:
                isSending || (!inputText.trim() && !imageBase64)
                  ? "var(--text-muted)"
                  : "white",
              cursor:
                isSending || (!inputText.trim() && !imageBase64)
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              flexShrink: 0,
              boxShadow:
                isSending || (!inputText.trim() && !imageBase64)
                  ? "none"
                  : "var(--shadow-glow-blue)",
            }}
          >
            {isSending ? (
              <RefreshCw
                size={18}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <p
          style={{
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            textAlign: "center",
            marginTop: 6,
          }}
        >
          Respuestas basadas exclusivamente en los procedimientos técnicos aprobados · Las imágenes se procesan de forma local y no se almacenan
        </p>
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
