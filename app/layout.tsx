import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asesor Digital de Calidad | Hub Bonding",
  description:
    "Asesor digital de inspección visual y ensamble de catéteres médicos. Guía a operarios de planta con criterios de aceptación basados en estándares ISO 13485 / FDA.",
  keywords: [
    "catéter",
    "inspección visual",
    "hub bonding",
    "calidad",
    "dispositivos médicos",
    "ISO 13485",
  ],
  robots: "noindex, nofollow", // Sistema interno — no indexar
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
