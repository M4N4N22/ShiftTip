"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { isConnected, address } = useAccount();

  const handleOpenDonations = () => {
    if (!address) return;
    const url = `/donations`;
    window.open(url, "_blank"); 
  };

  return (
    <nav className="fixed top-2 left-24 right-24 z-50 backdrop-blur-3xl rounded-full">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span>
            Shift<span className="text-primary">Tip</span>
          </span>
        </Link>

        {/* Main navigation links */}
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

          {isConnected && (
            <button
              onClick={handleOpenDonations}
              className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
            >
              My Donations
            </button>
          )}
        </div>

        {/* Wallet Connect */}
        <div className="flex items-center gap-3">
          <ConnectKitButton />
        </div>
      </div>
    </nav>
  );
}
