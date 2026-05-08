import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inscrição para Batismo - AD Ministério Tancredo Neves",
  description: "Formulário de inscrição para batismo na Igreja Assembléa de Deus Ministério Tancredo Neves",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Link href="/admin/login">Admin Login</Link>
        {children}
      </body>
    </html>
  );
}