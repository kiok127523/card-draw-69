import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@fontsource/ibm-plex-sans-thai/400.css";
import "@fontsource/ibm-plex-sans-thai/500.css";
import "@fontsource/ibm-plex-sans-thai/600.css";
import "@fontsource/ibm-plex-sans-thai/700.css";

export const metadata: Metadata = {
  title: "Card Draw - คำนวณความน่าจะเป็น",
  description: "เว็บคำนวณเปอร์เซ็นต์การจับใบดำใบแดง",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <body className="min-h-screen bg-background antialiased font-sans">{children}</body>
    </html>
  );
}
