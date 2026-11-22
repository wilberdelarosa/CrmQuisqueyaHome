import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Hanken_Grotesk } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import { empresa, variablesDeTema } from "@/infrastructure/empresa";
import "./globals.css";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const atkinson = Atkinson_Hyperlegible_Next({ subsets: ["latin"], variable: "--font-atkinson", display: "swap", adjustFontFallback: false });

export function generateMetadata(): Metadata {
  const { nombre, producto } = empresa();
  return {
    title: { default: `${producto} · ${nombre}`, template: `%s · ${nombre}` },
    description: `${producto} de ${nombre}`,
    manifest: "/manifest.json",
  };
}

export function generateViewport(): Viewport {
  return { themeColor: empresa().tema["brand-950"] ?? "#10172d", width: "device-width", initialScale: 1 };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const { idioma, tema } = empresa();
  return (
    <html lang={idioma} className={`${hanken.variable} ${atkinson.variable}`} style={variablesDeTema(tema) as CSSProperties}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
