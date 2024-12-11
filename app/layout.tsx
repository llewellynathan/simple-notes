import type { Metadata } from "next";
import { Bitter } from "next/font/google";
import "./globals.css";

const bitter = Bitter({ 
  subsets: ['latin'],
  variable: '--font-bitter'
});

export const metadata: Metadata = {
  title: "Simple Notes",
  description: "A simple notes application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${bitter.variable}`}>{children}</body>
    </html>
  );
}
