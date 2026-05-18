import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getBearerTokenFromHeader,
  type MobileAuthUser,
  verifyMobileToken,
} from "@/lib/mobile-auth";

export const currentUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  department: true,
  year: true,
  phone: true,
  interests: true,
  avatarUrl: true,
  orgId: true,
  isVerified: true,
  profileCompleted: true,
  isActive: true,
  org: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.UserSelect;

export type CurrentUser = Prisma.UserGetPayload<{
  select: typeof currentUserSelect;
}>;

async function findActiveUser(where: Prisma.UserWhereUniqueInput) {
  const user = await db.user.findUnique({
    where,
    select: currentUserSelect,
  });

  if (!user?.isActive) {
    return null;
  }

  return user;
}

export async function getCurrentUser(
  request?: NextRequest
): Promise<CurrentUser | null> {
  const bearerToken = getBearerTokenFromHeader(
    request?.headers.get("authorization") ?? null
  );

  if (bearerToken) {
    const payload = verifyMobileToken(bearerToken, "access");
    if (!payload) {
      return null;
    }

    return findActiveUser({ id: payload.sub });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  return findActiveUser({ email: session.user.email });
}

export function asMobileAuthUser(user: CurrentUser): MobileAuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    year: user.year,
    phone: user.phone,
    interests: user.interests,
    avatarUrl: user.avatarUrl,
    orgId: user.orgId,
    org: user.org,
    isVerified: user.isVerified,
    profileCompleted: user.profileCompleted,
  };
}
