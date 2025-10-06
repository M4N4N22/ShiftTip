"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50  backdrop-blur-lg ">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span>
            Shift<span className="text-primary">Tip</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/donate"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Donate
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ConnectKitButton />
        </div>
      </div>
    </nav>
  );
}
