import { Suspense } from "react";
import SuccessClient from "./SuccessClient.tsx";

export default function MembershipSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">
            Loading payment status…
          </p>
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
