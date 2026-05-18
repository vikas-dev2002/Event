import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { asMobileAuthUser } from "@/lib/current-user";
import {
  buildMobileAuthResponse,
  getBearerTokenFromHeader,
  verifyMobileToken,
} from "@/lib/mobile-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const refreshToken =
      body?.refreshToken ??
      getBearerTokenFromHeader(request.headers.get("authorization"));

    if (!refreshToken || typeof refreshToken !== "string") {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    const payload = verifyMobileToken(refreshToken, "refresh");
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: {
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
      },
    });

    if (!user?.isActive) {
      return NextResponse.json(
        { error: "User not found or inactive" },
        { status: 401 }
      );
    }

    if (user.role === "ORGANIZER" && !user.isVerified) {
      return NextResponse.json(
        {
          error: "Organizer account is pending verification.",
          code: "ORGANIZER_VERIFICATION_PENDING",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(buildMobileAuthResponse(asMobileAuthUser(user)));
  } catch (error) {
    console.error("Mobile refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}
