import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

type ViewFilter = "active" | "archived" | "all";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only organizers and admins can view organized events" },
        { status: 403 }
      );
    }

    const viewParam = request.nextUrl.searchParams.get("view");
    const currentView: ViewFilter =
      viewParam === "archived" || viewParam === "all" ? viewParam : "active";

    const scopeWhere: Prisma.EventWhereInput =
      user.role === "ADMIN"
        ? {}
        : user.orgId
          ? { orgId: user.orgId }
          : { organizerId: user.id };

    const statusWhere: Prisma.EventWhereInput =
      currentView === "active"
        ? { status: { notIn: ["ARCHIVED", "CANCELLED"] } }
        : currentView === "archived"
          ? { status: { in: ["ARCHIVED", "CANCELLED"] } }
          : {};

    const where: Prisma.EventWhereInput = { AND: [scopeWhere, statusWhere] };

    const [activeCount, archivedCount, allCount, events] = await Promise.all([
      db.event.count({
        where: { AND: [scopeWhere, { status: { notIn: ["ARCHIVED", "CANCELLED"] } }] },
      }),
      db.event.count({
        where: { AND: [scopeWhere, { status: { in: ["ARCHIVED", "CANCELLED"] } }] },
      }),
      db.event.count({ where: scopeWhere }),
      db.event.findMany({
        where,
        include: {
          organizer: {
            select: { id: true, name: true, email: true },
          },
          org: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: {
              registrations: { where: { status: { not: "CANCELLED" } } },
            },
          },
          registrations: {
            where: { status: { not: "CANCELLED" } },
            include: {
              attendance: {
                select: { id: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totals = events.reduce(
      (acc, event) => {
        const attended = event.registrations.filter((reg) => reg.attendance).length;
        acc.totalRegistrations += event._count.registrations;
        acc.totalAttended += attended;
        return acc;
      },
      { totalRegistrations: 0, totalAttended: 0 }
    );

    return NextResponse.json({
      view: currentView,
      tabs: {
        active: activeCount,
        archived: archivedCount,
        all: allCount,
      },
      stats: {
        totalEvents: events.length,
        totalRegistrations: totals.totalRegistrations,
        totalAttended: totals.totalAttended,
        attendanceRate:
          totals.totalRegistrations > 0
            ? Math.round((totals.totalAttended / totals.totalRegistrations) * 100)
            : 0,
        upcomingEvents: events.filter((event) => new Date(event.startDate) > new Date())
          .length,
      },
      events,
    });
  } catch (error) {
    console.error("Mobile organized events fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organized events" },
      { status: 500 }
    );
  }
}
