import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const original = await db.event.findUnique({ where: { id } });

    if (!original) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (original.organizerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to duplicate this event" }, { status: 403 });
    }

    const timestamp = Date.now();
    const slugBase = original.slug || original.title.toLowerCase().replace(/\s+/g, "-");
    const duplicated = await db.event.create({
      data: {
        title: `Copy of ${original.title}`,
        slug: `${slugBase}-copy-${timestamp}`,
        description: original.description,
        category: original.category,
        tags: original.tags,
        startDate: original.startDate,
        endDate: original.endDate,
        venue: original.venue,
        capacity: original.capacity,
        waitlistEnabled: original.waitlistEnabled,
        posterUrl: original.posterUrl,
        customFields: original.customFields as Prisma.InputJsonValue,
        organizerId: user.id,
        orgId: original.orgId,
        status: "DRAFT",
      },
      select: { id: true },
    });

    return NextResponse.json(
      {
        eventId: duplicated.id,
        message: "Event duplicated as draft",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error duplicating event:", error);
    return NextResponse.json({ error: "Failed to duplicate event" }, { status: 500 });
  }
}
