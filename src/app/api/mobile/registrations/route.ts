import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { getWaitlistPosition } from "@/lib/waitlist";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrations = await db.registration.findMany({
      where: {
        userId: user.id,
        status: { in: ["CONFIRMED", "WAITLISTED"] },
      },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            org: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                registrations: { where: { status: { not: "CANCELLED" } } },
              },
            },
          },
        },
        attendance: true,
      },
      orderBy: { registeredAt: "desc" },
    });

    const data = await Promise.all(
      registrations.map(async (registration) => ({
        ...registration,
        waitlistPosition:
          registration.status === "WAITLISTED"
            ? await getWaitlistPosition(registration.id)
            : null,
      }))
    );

    return NextResponse.json({
      registrations: data,
      count: data.length,
    });
  } catch (error) {
    console.error("Mobile registrations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
