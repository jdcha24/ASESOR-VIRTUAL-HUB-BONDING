"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  AlertTriangle,
  BarChart3,
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

  return (
    <AuthProvider>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--bg-base)",
        }}
      >
        {/* ── SIDEBAR ──────────────────────────────────── */}
        <aside
          style={{
            width: sidebarOpen ? 220 : 64,
            flexShrink: 0,
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.25s ease",
            overflow: "hidden",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: "16px 12px",
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
            {sidebarOpen && (
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

          {/* Toggle button */}
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

          {/* Nav items */}
          <nav style={{ flex: 1, padding: "8px 8px" }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`nav-${item.href.replace("/", "")}`}
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
                  {sidebarOpen && (
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
              {sidebarOpen && (
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
          }}
        >
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
