"use client";

import React, { useState } from "react";
import { loginUser } from "@/lib/firebase/auth";
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginUser(email, password);
      window.location.href = "/chat";
    } catch {
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 60% 20%, rgba(37,99,235,0.12) 0%, var(--bg-base) 60%)",
        padding: "24px 16px",
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "40px 36px",
        }}
      >
        {/* Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "var(--shadow-glow-blue)",
            }}
          >
            <Shield size={32} color="white" />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Asesor Digital de Calidad
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Hub Bonding & Inspección Visual · ISO 13485
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--danger-muted)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              marginBottom: 20,
              fontSize: "0.85rem",
              color: "var(--danger)",
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              htmlFor="email-input"
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Correo electrónico
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="operario@empresa.com"
              className="industrial-input"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password-input"
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="industrial-input"
                disabled={loading}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-btn"
            type="submit"
            disabled={loading || !email || !password}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "13px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background:
                loading || !email || !password
                  ? "var(--bg-elevated)"
                  : "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              color:
                loading || !email || !password ? "var(--text-muted)" : "white",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor:
                loading || !email || !password ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s ease",
              boxShadow:
                loading || !email || !password
                  ? "none"
                  : "var(--shadow-glow-blue)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                Ingresando...
              </>
            ) : (
              "Ingresar al Sistema"
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          Sistema de uso exclusivo para personal autorizado de planta.
          <br />
          Contacta a TI si tienes problemas de acceso.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
