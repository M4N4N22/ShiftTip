"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

import { MembershipHeader } from "@/components/dashboard/memberships/MembershipHeader";
import { MembershipStats } from "@/components/dashboard/memberships/MembershipStats";
import { MembershipPlanGrid } from "@/components/dashboard/memberships/MembershipPlanGrid";
import { CreateMembershipModal } from "@/components/dashboard/memberships/CreateMembershipModal";
import { MembershipShare } from "@/components/dashboard/memberships/MembershipShare";

import { useMembershipPlans } from "@/lib/hooks/useMembershipPlans";
import { MembershipPlan } from "@/components/dashboard/memberships/types";

export default function MembershipsPage() {
  const { address } = useAccount();

  const [open, setOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [sharingPlan, setSharingPlan] = useState<MembershipPlan | null>(null);

  const { plans, loading } = useMembershipPlans(address);

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleCreate = () => {
    setEditingPlan(null);
    setOpen(true);
  };

  const handleEdit = (plan: MembershipPlan) => {
    setSharingPlan(null);
    setEditingPlan(plan);
    setOpen(true);
  };

  const handleShare = (plan: MembershipPlan) => {
    setEditingPlan(null);
    setSharingPlan(plan);
  };

  return (
    <div className="space-y-8">
      <MembershipHeader onCreate={handleCreate} />

      {address && <MembershipStats creatorWallet={address} />}

      <MembershipPlanGrid
        plans={plans}
        loading={loading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onShare={handleShare}
      />

      {/* Share Panel */}
      {sharingPlan && (
        <MembershipShare subscribeUrl={`/subscribe/${sharingPlan.id}`} />
      )}

      {/* Create / Edit Modal */}
      {address && (
        <CreateMembershipModal
          creatorWallet={address}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
