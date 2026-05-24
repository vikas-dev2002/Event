import { NextRequest, NextResponse } from "next/server";
import { getAllMappedColleges } from "@/lib/college-domain-map";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { serializeMobileUser } from "@/lib/mobile-auth";
import { profileSchema } from "@/lib/validators/profile";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user: serializeMobileUser(user) });
  } catch (error) {
    console.error("Mobile me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    let resolvedOrgId: string | null = currentUser.orgId;

    if (!resolvedOrgId && parsed.data.organizationSlug) {
      const college = getAllMappedColleges().find(
        (item) => item.slug === parsed.data.organizationSlug
      );

      if (!college) {
        return NextResponse.json(
          { error: "Unknown college selection." },
          { status: 400 }
        );
      }

      const org = await db.organization.upsert({
        where: { slug: college.slug },
        create: {
          name: college.name,
          slug: college.slug,
          settings: JSON.stringify({
            city: college.city,
            type: college.type,
          }),
        },
        update: {},
      });

      resolvedOrgId = org.id;
    }

    if (!resolvedOrgId) {
      return NextResponse.json(
        { error: "Please select your college to complete your profile." },
        { status: 400 }
      );
    }

    const updated = await db.user.update({
      where: { id: currentUser.id },
      data: {
        name: parsed.data.name,
        department: parsed.data.department || null,
        year: parsed.data.year || null,
        phone: parsed.data.phone || null,
        interests: parsed.data.interests,
        orgId: resolvedOrgId,
        profileCompleted: true,
      },
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

    return NextResponse.json({
      message: "Profile updated successfully",
      user: serializeMobileUser(updated),
    });
  } catch (error) {
    console.error("Mobile profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
