import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cinque Ristorante — Cucina italiana, Berlino",
  description: "Cucina italiana d'autore nel cuore di Berlino dal 2006. Pranzi di lavoro, cene private e celebrazioni.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&family=Geist+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
