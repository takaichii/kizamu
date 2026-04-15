import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Kizamu（刻む）",
    template: "%s | Kizamu",
  },
  description: "今日も生きた、を積み重ねるアプリ。小さな達成を記録して、人生を刻んでいこう。",
  openGraph: {
    title: "Kizamu（刻む）",
    description: "今日も生きた、を積み重ねるアプリ。小さな達成を記録して、人生を刻んでいこう。",
    siteName: "Kizamu",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kizamu（刻む）",
    description: "今日も生きた、を積み重ねるアプリ。小さな達成を記録して、人生を刻んでいこう。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifJP.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
