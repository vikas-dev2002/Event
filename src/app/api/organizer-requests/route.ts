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

    const requests = await db.organizerRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true,
            createdAt: true,
          },
        },
        reviewer: {
          select: { name: true },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      requests,
      pendingCount: requests.filter(request => request.status === "PENDING").length,
    });
  } catch (error) {
    console.error("Error fetching organizer requests:", error);
    return NextResponse.json({ error: "Failed to fetch organizer requests" }, { status: 500 });
  }
}
