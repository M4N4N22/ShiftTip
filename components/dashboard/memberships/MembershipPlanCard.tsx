import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MembershipPlan } from "./types";
import { Share2 } from "lucide-react";

export function MembershipPlanCard({
  plan,
  onEdit,
  onShare,
}: {
  plan: MembershipPlan;
  onEdit: (plan: MembershipPlan) => void;
  onShare: (plan: MembershipPlan) => void;
}) {
  return (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <Badge variant="secondary" className="mt-1">
              Active
            </Badge>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold">
              ${plan.price}
            </div>
            <div className="text-sm text-muted-foreground">
              per month
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-4 text-sm">
          <div>
            <p className="text-muted-foreground">Members</p>
            <p className="text-lg font-medium">{plan.members}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Revenue</p>
            <p className="text-lg font-medium">
              ${plan.monthlyRevenue}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => onShare(plan)}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(plan)}
            className="opacity-60 hover:opacity-100"
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
