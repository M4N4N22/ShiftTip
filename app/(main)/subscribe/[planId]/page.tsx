import { SubscribePlan } from "@/components/subscribe/SubscribePlan";

export default function SubscribePage({
  params,
}: {
  params: { planId: string };
}) {
  return (
    <div className="py-16 px-4">
      <SubscribePlan planId={params.planId} />
    </div>
  );
}
