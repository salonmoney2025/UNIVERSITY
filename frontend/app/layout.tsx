import type { Metadata } from "next";
import localFont from "next/font/local";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "EBKUST University LMS",
  description: "Ernest Bai Koroma University of Science and Technology - Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <Toaster position="top-right" />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
