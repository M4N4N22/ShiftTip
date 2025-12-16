import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MembershipPlan } from "./types";
import { MembershipPlanCard } from "./MembershipPlanCard";
import { MembershipPlanCardSkeleton } from "./MembershipPlanCardSkeleton";

export function MembershipPlanGrid({
  plans,
  onCreate,
  onEdit,
  onShare,
  loading,
}: {
  plans: MembershipPlan[];
  onCreate: () => void;
  onEdit: (plan: MembershipPlan) => void;
  onShare: (plan: MembershipPlan) => void;
  loading: boolean;
}) {
  // -----------------------------
  // Loading state
  // -----------------------------
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <MembershipPlanCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // -----------------------------
  // Empty state
  // -----------------------------
  if (!plans.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <p className="text-muted-foreground">
            You haven’t created any memberships yet.
          </p>
          <Button onClick={onCreate}>
            Create your first membership
          </Button>
        </CardContent>
      </Card>
    );
  }

  // -----------------------------
  // Data state
  // -----------------------------
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <MembershipPlanCard
          key={plan.id}
          plan={plan}
          onEdit={onEdit}
          onShare={onShare}
        />
      ))}
    </div>
  );
}
