import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
