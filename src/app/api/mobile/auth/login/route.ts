import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { asMobileAuthUser } from "@/lib/current-user";
import { buildMobileAuthResponse } from "@/lib/mobile-auth";
import { loginSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
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
            logo: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.role === "ORGANIZER" && !user.isVerified) {
      return NextResponse.json(
        {
          error: "Your organizer account is pending verification.",
          code: "ORGANIZER_VERIFICATION_PENDING",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(buildMobileAuthResponse(asMobileAuthUser(user)));
  } catch (error) {
    console.error("Mobile login error:", error);
    return NextResponse.json(
      { error: "Failed to log in" },
      { status: 500 }
    );
  }
}
