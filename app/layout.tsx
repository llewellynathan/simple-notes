import type { Metadata } from "next";
import { Bitter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth-context';

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
      <body className={`antialiased ${bitter.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
