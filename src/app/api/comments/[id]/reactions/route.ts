import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id: commentId } = await params;

    const comment = await db.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const { emoji } = await req.json();
    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
    }

    const existing = await db.commentReaction.findUnique({
      where: { userId_commentId_emoji: { userId: user.id, commentId, emoji } },
    });

    if (existing) {
      await db.commentReaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed", emoji });
    }

    await db.commentReaction.create({
      data: { emoji, userId: user.id, commentId },
    });

    return NextResponse.json({ action: "added", emoji });
  } catch (error) {
    console.error("Error toggling comment reaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
