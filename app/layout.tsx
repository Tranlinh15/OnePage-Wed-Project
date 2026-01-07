import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs"; 
import { Toaster } from "sonner";
import AIChatButton from "./_components/AIChatButton"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OPPM Manager",
  description: "Quản lý dự án chuyên nghiệp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="vi">
        <body className={inter.className}>
          {children}

          <Toaster position="top-center" />
          <AIChatButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
