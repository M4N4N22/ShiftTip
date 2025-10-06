import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";

export const metadata: Metadata = {
  title: "ShiftTip",
  description: "Accept crypto donations instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Wrap children with Web3Provider */}
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
