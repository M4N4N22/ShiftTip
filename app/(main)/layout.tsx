// app/(main)/layout.tsx
import Image from "next/image";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/st3.png"
          alt="Streaming / Crypto Hero"
          fill
          className="object-cover w-full h-full"
          priority
        />
        {/* Dark / blur overlay */}
        <div className="absolute inset-0 bg-background/85 backdrop-blur-2xl"></div>
      </div>

      {/* Page content on top */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
