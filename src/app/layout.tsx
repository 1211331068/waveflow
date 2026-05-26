import type { Metadata } from "next";
import ShaderBackground from "@/components/shader-background";
import "./globals.css";

export const metadata: Metadata = {
  title: "WaveFlow - 沉浸式音乐平台",
  description: "发现你的音乐宇宙",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col font-sans">
        <ShaderBackground />
        {children}
      </body>
    </html>
  );
}
