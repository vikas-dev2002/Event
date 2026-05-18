import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only organizers and admins can view event students" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const event = await db.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, email: true, name: true },
        },
        org: {
          select: { id: true, name: true, slug: true },
        },
        registrations: {
          where: { status: { in: ["CONFIRMED", "WAITLISTED"] } },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                year: true,
                phone: true,
              },
            },
            attendance: {
              select: {
                checkedInAt: true,
                method: true,
              },
            },
          },
          orderBy: { registeredAt: "asc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const canAccess =
      user.role === "ADMIN" ||
      event.organizer.id === user.id ||
      (!!user.orgId && event.org?.id === user.orgId);

    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const confirmedRegistrations = event.registrations.filter(
      (registration) => registration.status === "CONFIRMED"
    );
    const waitlistedRegistrations = event.registrations.filter(
      (registration) => registration.status === "WAITLISTED"
    );
    const attendedCount = confirmedRegistrations.filter(
      (registration) => registration.attendance
    ).length;

    return NextResponse.json({
      event,
      stats: {
        confirmedCount: confirmedRegistrations.length,
        waitlistedCount: waitlistedRegistrations.length,
        attendedCount,
        absentCount: confirmedRegistrations.length - attendedCount,
        attendanceRate:
          confirmedRegistrations.length > 0
            ? Math.round((attendedCount / confirmedRegistrations.length) * 100)
            : 0,
        capacityFillRate:
          event.capacity > 0
            ? Math.round((confirmedRegistrations.length / event.capacity) * 100)
            : 0,
      },
      confirmedRegistrations,
      waitlistedRegistrations,
    });
  } catch (error) {
    console.error("Mobile event students fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event students" },
      { status: 500 }
    );
  }
}
