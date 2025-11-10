"use client";

import "./transaction-flow.css"; // keep this for arrow animation only
import { shortenAddress } from "@/lib/utils";

interface TransactionFlowProps {
  fromToken?: string;
  fromChain?: string;
  fromAddress?: string;
  toToken?: string;
  toChain?: string;
  toAddress?: string;
}

export default function TransactionFlow({
  fromToken,
  fromChain,
  fromAddress,
  toToken,
  toChain,
  toAddress,
}: TransactionFlowProps) {
  return (
    <div className="relative w-full flex justify-between items-center  rounded-3xl text-white  overflow-hidden">
      {/* LEFT SIDE */}
      <div className="flex flex-col items-start min-w-[130px] text-left bg-gradient-to-r from-zinc-300/10 via-transparent p-6">
        <p className="text-[10px] uppercase tracking-widest text-zinc-400">From</p>
        <p className="text-sm font-semibold text-white">
          {fromToken ? fromToken.toUpperCase() : "—"}
        </p>
        <p className="text-[11px] text-zinc-500 mb-1">
          {fromChain || "Select chain"}
        </p>
        <p className="text-[11px] text-zinc-400 font-mono break-all max-w-[160px]">
        {fromAddress ? shortenAddress(fromAddress) : "Not connected"}
        </p>
      </div>

      {/* ANIMATED ARROWS (CSS handles animation) */}
      <div className="arrow-container">
        <div className="arrowSliding">
          <div className="arrow"></div>
        </div>
        <div className="arrowSliding delay1">
          <div className="arrow"></div>
        </div>
        <div className="arrowSliding delay2">
          <div className="arrow"></div>
        </div>
        <div className="arrowSliding delay3">
          <div className="arrow"></div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col items-start min-w-[130px] text-left bg-gradient-to-l from-zinc-300/10 via-transparent p-6">
        <p className="text-[10px] uppercase tracking-widest text-zinc-400">To</p>
        <p className="text-sm font-semibold text-white">
          {toToken ? toToken.toUpperCase() : "—"}
        </p>
        <p className="text-[11px] text-zinc-500 mb-1">
          {toChain || "Target chain"}
        </p>
        <p className="text-[11px] text-zinc-400 font-mono break-all max-w-[160px]">
        {toAddress ? shortenAddress(toAddress) : "Not connected"}
        </p>
      </div>
    </div>
  );
}
