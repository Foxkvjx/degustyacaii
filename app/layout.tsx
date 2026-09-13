import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";
import MutationSync from "./components/MutationSync";
import SyncIndicator from "./components/SyncIndicator";
import MobileNav from "./components/MobileNav";
import AuthGate from "./components/AuthGate";
import PreventZoom from "./components/PreventZoom";

export const metadata: Metadata = {
  title: "Degusty Açaí | Controle Operacional",
  description: "Estoque, vendas, gastos e clima — Degusty Açaí",
  applicationName: "Degusty Açaí",
  themeColor: "#000000",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Degusty Açaí",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <PreventZoom />
        <ThemeToggle />
        <AuthGate>
          <MutationSync />
          <SyncIndicator />
          {children}
          <MobileNav persistent />
        </AuthGate>
      </body>
    </html>
  );
}
