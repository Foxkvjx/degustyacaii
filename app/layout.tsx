import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Degusty Açaí | Controle Operacional",
  description: "Estoque, vendas, gastos e clima — Degusty Açaí",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
