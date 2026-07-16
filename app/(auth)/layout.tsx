import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso — Asesor Digital de Calidad",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
