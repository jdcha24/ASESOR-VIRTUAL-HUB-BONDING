"use client";

import React, { useCallback, useRef, useState } from "react";
import { Camera, X, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string, previewUrl: string) => void;
  onImageCleared: () => void;
  previewUrl: string | null;
  disabled?: boolean;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export function ImageUploader({
  onImageSelected,
  onImageCleared,
  previewUrl,
  disabled,
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Solo se aceptan imágenes JPEG, PNG, WebP o HEIC.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError("La imagen supera el límite de 5 MB.");
        return;
      }

      // Preview local EFÍMERO — URL.createObjectURL vive solo en esta sesión
      // Nunca se envía al servidor en este formato
      const previewObjectUrl = URL.createObjectURL(file);

      // Convertir a Base64 para el servidor (solo en memoria)
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      onImageSelected(base64, file.type, previewObjectUrl);
    },
    [onImageSelected]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset input para permitir seleccionar el mismo archivo de nuevo
      e.target.value = "";
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleClear = useCallback(() => {
    // Liberar el Object URL para que el GC pueda limpiar la memoria
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onImageCleared();
    setError(null);
  }, [previewUrl, onImageCleared]);

  if (previewUrl) {
    return (
      <div
        style={{
          position: "relative",
          width: 64,
          height: 64,
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          border: "2px solid var(--brand-primary)",
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Imagen adjunta para análisis"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <button
          type="button"
          onClick={handleClear}
          title="Eliminar imagen"
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            background: "rgba(0,0,0,0.75)",
            border: "none",
            borderRadius: "50%",
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
          }}
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        id="image-upload-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        title="Adjuntar imagen para análisis de defectos"
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--radius-md)",
          border: isDragging
            ? "2px dashed var(--brand-primary)"
            : "2px dashed var(--border-default)",
          background: isDragging ? "var(--brand-primary-muted)" : "var(--bg-elevated)",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isDragging ? "var(--brand-primary)" : "var(--text-secondary)",
          transition: "all 0.15s ease",
        }}
      >
        {isDragging ? <ImageIcon size={20} /> : <Camera size={20} />}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleFileChange}
        style={{ display: "none" }}
        aria-label="Cargar imagen de defecto"
      />

      {error && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius-sm)",
            padding: "6px 10px",
            fontSize: "0.72rem",
            color: "var(--danger)",
            whiteSpace: "nowrap",
            zIndex: 20,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
