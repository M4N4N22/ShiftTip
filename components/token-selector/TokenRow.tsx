"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface TokenRowProps {
  coin: string;
  name: string;
  network: string;
  balance: number;
  usdValue: number;
  selected: boolean;
  onClick: () => void;
}

export const TokenRow: React.FC<TokenRowProps> = ({
  coin,
  name,
  network,
  balance,
  usdValue,
  selected,
  onClick,
}) => {
  const [iconError, setIconError] = useState(false);
  const iconUrl = `/api/coin-icon/${coin}-${network}`;

  // 🧠 Log what’s being fetched + validate it
  useEffect(() => {
    console.log(`[TokenRow] 🔍 Fetching icon for ${coin}-${network}:`, iconUrl);
    fetch(iconUrl)
      .then(async (res) => {
        const type = res.headers.get("content-type");
        const size = res.headers.get("content-length");
        console.log(
          `[TokenRow] ✅ ${coin}-${network} | status: ${res.status}, type: ${type}, size: ${size}`
        );
        if (!res.ok || !type?.includes("image")) {
          console.warn(`[TokenRow] ⚠️ Invalid image for ${coin}-${network}`);
          setIconError(true);
        }
      })
      .catch((err) => {
        console.error(
          `[TokenRow] ❌ Error fetching icon ${coin}-${network}:`,
          err
        );
        setIconError(true);
      });
  }, [iconUrl, coin, network]);

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-2 py-2 cursor-pointer rounded-lg 
        transition-all duration-200 ease-out mb-1
        active:scale-[0.97] active:brightness-95
        ${selected ? "bg-green-500/10" : "hover:bg-white/10"}`}
    >
      {/* Left side: Icon + token info */}
      <div className="flex items-center gap-3 truncate">
        <div className="relative flex-shrink-0 p-1">
          {/* Outer container for proper overflow control */}
          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
            {!iconError ? (
              <img
                src={iconUrl}
                alt={`${coin} icon`}
                width={40}
                height={40}
                onError={() => {
                  console.warn(
                    `[TokenRow] ⚠️ onError triggered for ${coin}-${network}`
                  );
                  setIconError(true);
                }}
                className="object-contain rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-white/50 uppercase">
                {coin.slice(0, 2)}
              </div>
            )}
          </div>

          {/* ✅ Network badge (moved outside overflow area) */}
          <div className="absolute -bottom-0 -right-0 w-5 h-5 rounded-lg border-2 border-black flex items-center justify-center shadow-lg ">
            <img
              src={`/api/coin-icon/${network}-${network}`}
              alt={`${network} icon`}
              width={20}
              height={20}
              className="object-contain rounded-lg shadow-lg"
              onError={(e) => {
                console.warn(
                  `[TokenRow] ⚠️ Missing network icon for ${network}`
                );
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>

        <div className="flex flex-col truncate">
          <span className="text-white truncate">{name}</span>
          <span className="text-xs text-white/60 uppercase truncate">
            {network}
          </span>
        </div>
      </div>

      {/* Right side: Balance + tick */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col text-right">
          <span className="text-white text-sm">
            {balance !== undefined
              ? balance < 0.01
                ? balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })
                : balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
              : "0.00"}
          </span>

          <span className="text-xs text-white/60">
            {usdValue ? `$${usdValue.toFixed(2)}` : ""}
          </span>
        </div>

        {selected && (
          <div className="flex items-center justify-center rounded-full bg-green-500/10 p-1 animate-slide-fade-in">
            <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  );
};
