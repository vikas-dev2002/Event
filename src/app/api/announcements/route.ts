import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user || !user.orgId) {
      return NextResponse.json({ error: "User not found or no organization" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      db.announcement.findMany({
        where: { orgId: user.orgId },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true, role: true } },
          org: { select: { id: true, name: true, logo: true } },
          event: { select: { id: true, title: true, slug: true } },
          _count: { select: { comments: true, reactions: true } },
          reactions: {
            where: { userId: user.id },
            select: { emoji: true },
          },
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      db.announcement.count({ where: { orgId: user.orgId } }),
    ]);

    // Get aggregated reaction counts per announcement
    const announcementsWithReactions = await Promise.all(
      announcements.map(async (a) => {
        const reactionCounts = await db.announcementReaction.groupBy({
          by: ["emoji"],
          where: { announcementId: a.id },
          _count: { emoji: true },
        });
        return {
          ...a,
          reactionCounts: reactionCounts.map((r) => ({ emoji: r.emoji, count: r._count.emoji })),
          userReactions: a.reactions.map((r) => r.emoji),
        };
      })
    );

    return NextResponse.json({
      announcements: announcementsWithReactions,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!currentUser.orgId) {
      return NextResponse.json({ error: "User not found or no organization" }, { status: 404 });
    }

    if (currentUser.role !== "ORGANIZER" && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Only organizers and admins can post announcements" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, eventId, isPinned } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Validate eventId if provided
    if (eventId) {
      const event = await db.event.findUnique({ where: { id: eventId }, select: { id: true, orgId: true } });
      if (!event || event.orgId !== currentUser.orgId) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
    }

    const announcement = await db.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        isPinned: isPinned || false,
        authorId: currentUser.id,
        orgId: currentUser.orgId,
        eventId: eventId || null,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, role: true } },
        org: { select: { id: true, name: true, logo: true } },
        event: { select: { id: true, title: true, slug: true } },
      },
    });

    // Notify all org members (except author)
    const orgMembers = await db.user.findMany({
      where: { orgId: currentUser.orgId, id: { not: currentUser.id } },
      select: { id: true },
    });

    if (orgMembers.length > 0) {
      await db.notification.createMany({
        data: orgMembers.map((member) => ({
          type: "ANNOUNCEMENT_POSTED" as const,
          title: "New Announcement",
          message: `${currentUser.name} posted: ${title.trim()}`,
          link: `/announcements/${announcement.id}`,
          userId: member.id,
        })),
      });
    }

    return NextResponse.json({ announcement, message: "Announcement posted" }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
