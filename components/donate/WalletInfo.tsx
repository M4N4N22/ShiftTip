import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WalletInfoProps {
  address: string | undefined;
  donorName: string;
  setDonorName: (name: string) => void;
  isConnected: boolean;
}

export const WalletInfo = ({ address, donorName, setDonorName, isConnected }: WalletInfoProps) => (
  <div className="space-y-4">
    {!isConnected && (
      <p className="text-sm text-muted-foreground">
        Please connect your wallet to continue.
      </p>
    )}

    <div className="space-y-2">
      <Label>Wallet Address (Auto-filled)</Label>
      <Input value={address || ""} disabled />
    </div>

    <div className="space-y-2">
      <Label>Your Name (Optional)</Label>
      <Input
        value={donorName}
        onChange={(e) => setDonorName(e.target.value)}
        placeholder="Anonymous"
      />
    </div>
  </div>
);
