"use client";

import { Button } from "@/components/ui/button";

export function MembershipHeader({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Memberships</h1>
        <p className="text-sm text-muted-foreground">
          Manage plans, pricing, and active subscribers
        </p>
      </div>

      <Button onClick={onCreate}>Create Membership</Button>
    </div>
  );
}
