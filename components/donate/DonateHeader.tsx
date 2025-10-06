"use client";
export default function DonateHeader({ streamerName }: { streamerName: string }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-2">
        Donate to <span className="gradient-text">{streamerName}</span>
      </h1>
      <p className="text-muted-foreground">
        Support with any cryptocurrency — they receive instant USDC
      </p>
    </div>
  );
}
