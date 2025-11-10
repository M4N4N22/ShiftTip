import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner"; // ✅ Import toaster

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShiftTip",
  description: "Accept crypto donations instantly",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakarta.className}>
      <body className="antialiased">
        <Web3Provider>
          {children}
          <Toaster
            richColors
            position="top-center"
            toastOptions={{
              style: {
                background: "rgba(20, 20, 20, 0.9)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
