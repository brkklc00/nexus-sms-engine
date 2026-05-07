import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXUS SMS Engine",
  description: "NEXUS SMS gönderim, rehber, kredi ve kampanya yönetim platformu",
  icons: {
    icon: "https://i.ibb.co/nN2TdWjf/default-avatar.png",
    shortcut: "https://i.ibb.co/nN2TdWjf/default-avatar.png",
    apple: "https://i.ibb.co/nN2TdWjf/default-avatar.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
