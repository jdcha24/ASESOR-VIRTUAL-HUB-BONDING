"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  AlertTriangle,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { logoutUser } from "@/lib/firebase/auth";
import { AuthProvider } from "@/context/AuthContext";

const NAV_ITEMS = [
  {
    href: "/chat",
    label: "Consultas",
    icon: MessageSquare,
    roles: ["operator", "supervisor", "quality_engineer"],
  },
  {
    href: "/supervisor",
    label: "Escalaciones",
    icon: AlertTriangle,
    roles: ["supervisor", "quality_engineer"],
  },
  {
    href: "/settings",
    label: "Configuración",
    icon: Settings,
    roles: ["quality_engineer"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamaño de pantalla para vista móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Mobile cerrado por defecto
      } else {
        setSidebarOpen(true);  // Desktop abierto por defecto
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <AuthProvider>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--bg-base)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Botón flotante para móvil (Hamburguesa) */}
        {isMobile && (
          <button
            type="button"
            id="mobile-menu-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            style={{
              position: "fixed",
              top: 12,
              left: 12,
              zIndex: 90,
              width: 44,
              height: 44,
              borderRadius: "var(--radius-md)",
              background: "var(--bg-elevated)",
              border: "1.5px solid var(--border-default)",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        {/* Fondo oscuro traslúcido para cerrar en móvil */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 95,
            }}
          />
        )}

        {/* ── SIDEBAR ──────────────────────────────────── */}
        <aside
          style={{
            // Si es móvil, se posiciona flotando. Si es desktop, mantiene el flex layout normal.
            position: isMobile ? "fixed" : "relative",
            top: 0,
            left: isMobile ? (sidebarOpen ? 0 : -220) : 0,
            height: "100vh",
            zIndex: 100,
            width: isMobile ? 220 : sidebarOpen ? 220 : 64,
            flexShrink: 0,
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            boxShadow: isMobile && sidebarOpen ? "5px 0 25px rgba(0,0,0,0.5)" : "none",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: isMobile ? "16px 16px" : "16px 12px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              minHeight: 64,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "var(--shadow-glow-blue)",
              }}
            >
              <Shield size={20} color="white" />
            </div>
            {(sidebarOpen || isMobile) && (
              <div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Asesor Digital
                </p>
                <p
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Calidad · ISO 13485
                </p>
              </div>
            )}
          </div>

          {/* Toggle button (Solo visible en Desktop) */}
          {!isMobile && (
            <button
              type="button"
              id="sidebar-toggle"
              onClick={() => setSidebarOpen((o) => !o)}
              style={{
                padding: "10px 12px",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: sidebarOpen ? "flex-end" : "center",
              }}
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          )}

          {/* Nav items */}
          <nav style={{ flex: 1, padding: "8px 8px", marginTop: isMobile ? 12 : 0 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`nav-${item.href.replace("/", "")}`}
                  onClick={() => {
                    if (isMobile) setSidebarOpen(false); // Auto cerrar al navegar en móvil
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: 2,
                    textDecoration: "none",
                    color: isActive ? "var(--text-accent)" : "var(--text-muted)",
                    background: isActive ? "var(--brand-primary-muted)" : "transparent",
                    borderLeft: isActive
                      ? "3px solid var(--brand-primary)"
                      : "3px solid transparent",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {(sidebarOpen || isMobile) && (
                    <>
                      <span style={{ fontSize: "0.85rem", fontWeight: isActive ? 600 : 400, flex: 1 }}>
                        {item.label}
                      </span>
                      {isActive && <ChevronRight size={14} />}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div
            style={{
              padding: "12px 8px",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <button
              id="logout-btn"
              type="button"
              onClick={() => {
                logoutUser().then(() => {
                  window.location.href = "/login";
                });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                width: "100%",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              <LogOut size={18} style={{ flexShrink: 0 }} />
              {(sidebarOpen || isMobile) && (
                <span style={{ fontSize: "0.85rem" }}>Cerrar sesión</span>
              )}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: "100vh",
            // Padding a la izquierda en móvil para dejar espacio al botón hamburguesa si el header del chat no cubre la zona superior
            paddingTop: isMobile ? 0 : 0,
          }}
        >
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
