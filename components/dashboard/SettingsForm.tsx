"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SettingsFormProps {
  streamerName: string;
  setStreamerName: (v: string) => void;
  walletAddress: string;
  setWalletAddress: (v: string) => void;
}

export default function SettingsForm({
  streamerName,
  setStreamerName,
  walletAddress,
  setWalletAddress,
}: SettingsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Update your wallet and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Your Streaming Name</Label>
          <Input value={streamerName} onChange={(e) => setStreamerName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Wallet Address</Label>
          <Input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
        </div>

        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
