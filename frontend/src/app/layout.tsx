import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from '@/components/ClientProviders';
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Sistema de Taller",
  description: "Gestión de taller mecánico y venta de repuestos",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
