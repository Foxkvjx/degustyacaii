import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";
import MutationSync from "./components/MutationSync";
import SyncIndicator from "./components/SyncIndicator";

export const metadata: Metadata = {
  title: "Degusty Açaí | Controle Operacional",
  description: "Estoque, vendas, gastos e clima — Degusty Açaí",
  applicationName: "Degusty Açaí",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    title: "Degusty Açaí",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeToggle />
        <MutationSync />
        <SyncIndicator />
        {children}
      </body>
    </html>
  );
}
