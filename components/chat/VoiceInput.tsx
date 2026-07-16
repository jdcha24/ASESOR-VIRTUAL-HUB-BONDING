"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  AlertTriangle,
  X,
} from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);


  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognitionAPI();
    recognition.lang = "es-CR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setError(`Error de voz: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        id="voice-input-btn"
        type="button"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        title={isListening ? "Detener grabación" : "Activar dictado por voz"}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          background: isListening
            ? "var(--danger)"
            : disabled
            ? "var(--bg-elevated)"
            : "var(--bg-elevated)",
          color: isListening
            ? "white"
            : disabled
            ? "var(--text-muted)"
            : "var(--text-secondary)",
          boxShadow: isListening ? "0 0 0 4px rgba(239,68,68,0.25)" : "none",
        }}
        className={isListening ? "mic-recording" : ""}
      >
        {isListening ? <MicOff size={22} /> : <Mic size={22} />}
      </button>

      {isListening && (
        <span
          style={{
            fontSize: "0.65rem",
            color: "var(--danger)",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Escuchando...
        </span>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            right: 0,
            marginBottom: 8,
            background: "var(--bg-card)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius-md)",
            padding: "8px 12px",
            fontSize: "0.75rem",
            color: "var(--danger)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          <AlertTriangle size={14} />
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
