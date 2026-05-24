import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { asMobileAuthUser } from "@/lib/current-user";
import { buildMobileAuthResponse } from "@/lib/mobile-auth";
import { registerUser } from "@/lib/actions/auth";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const result = await registerUser(parsed.data);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
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
            logo: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User registration succeeded but user lookup failed" },
        { status: 500 }
      );
    }

    if (user.role === "ORGANIZER") {
      return NextResponse.json(
        {
          requiresVerification: true,
          message:
            "Organizer registration submitted. Please wait for admin verification.",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified,
            profileCompleted: user.profileCompleted,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(buildMobileAuthResponse(asMobileAuthUser(user)), {
      status: 201,
    });
  } catch (error) {
    console.error("Mobile register error:", error);
    return NextResponse.json(
      { error: "Failed to register account" },
      { status: 500 }
    );
  }
}
