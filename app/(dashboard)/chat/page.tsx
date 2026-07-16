import type { Metadata } from "next";
import { ChatInterface } from "@/components/chat/ChatInterface";

export const metadata: Metadata = {
  title: "Consultas — Asesor Digital de Calidad",
};

export default function ChatPage() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <ChatInterface />
    </div>
  );
}
