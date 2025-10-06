"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Donation {
  id: number;
  donor: string;
  amount: string;
  currency: string;
  token: string;
  time: string;
}

export default function RecentDonations({ donations }: { donations: Donation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Donations</CardTitle>
        <CardDescription>Your latest crypto donations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {donations.map((donation) => (
            <div
              key={donation.id}
              className="flex items-center justify-between p-4 rounded-lg bg-zinc-100/5 hover:bg-zinc-100/10 transition-colors"
            >
              <div>
                <div className="font-semibold">{donation.donor}</div>
                <div className="text-sm text-muted-foreground">
                  Donated via {donation.token} • {donation.time}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-500">
                  ${donation.amount}
                </div>
                <div className="text-sm text-muted-foreground">{donation.currency}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
