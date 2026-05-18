import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalColleges,
      totalUsers,
      totalEvents,
      totalRegistrations,
      totalCertificates,
      pendingOrganizerRequests,
      recentOrganizations,
      recentEvents,
    ] = await Promise.all([
      db.organization.count(),
      db.user.count(),
      db.event.count(),
      db.registration.count(),
      db.certificate.count(),
      db.organizerRequest.count({ where: { status: "PENDING" } }),
      db.organization.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { users: true, events: true } },
        },
      }),
      db.event.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          org: { select: { name: true } },
          organizer: { select: { name: true } },
          _count: {
            select: { registrations: { where: { status: { not: "CANCELLED" } } } },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalColleges,
        totalUsers,
        totalEvents,
        totalRegistrations,
        totalCertificates,
        pendingOrganizerRequests,
      },
      recentOrganizations,
      recentEvents,
    });
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    return NextResponse.json({ error: "Failed to fetch admin overview" }, { status: 500 });
  }
}
