import { prisma } from "@/lib/prisma";

export async function hasActiveMembership(
  userId: string,
  planId: string
): Promise<boolean> {
  const membership = await prisma.membership.findUnique({
    where: {
      planId_userId: {
        planId,
        userId,
      },
    },
  });

  return membership?.status === "active";
}
