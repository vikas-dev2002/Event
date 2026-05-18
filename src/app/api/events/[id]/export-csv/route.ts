import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUserSelect, getCurrentUser } from "@/lib/current-user";
import { verifyMobileToken } from "@/lib/mobile-auth";

async function getExportUser(request: NextRequest) {
  const currentUser = await getCurrentUser(request);
  if (currentUser) {
    return currentUser;
  }

  const mobileToken = request.nextUrl.searchParams.get("token");
  if (!mobileToken) {
    return null;
  }

  const payload = verifyMobileToken(mobileToken, "access");
  if (!payload) {
    return null;
  }

  const mobileUser = await db.user.findUnique({
    where: { id: payload.sub },
    select: currentUserSelect,
  });

  if (!mobileUser?.isActive) {
    return null;
  }

  return mobileUser;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getExportUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const event = await db.event.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            user: {
              select: {
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

    if (event.organizerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Build CSV
    const headers = ["Name", "Email", "Department", "Year", "Phone", "Status", "Registered At", "Attended", "Check-in Time", "Check-in Method"];
    const rows = event.registrations.map((reg) => [
      escapeCsv(reg.user.name),
      escapeCsv(reg.user.email),
      escapeCsv(reg.user.department || ""),
      escapeCsv(reg.user.year || ""),
      escapeCsv(reg.user.phone || ""),
      reg.status,
      new Date(reg.registeredAt).toLocaleString("en-IN"),
      reg.attendance ? "Yes" : "No",
      reg.attendance ? new Date(reg.attendance.checkedInAt).toLocaleString("en-IN") : "",
      reg.attendance?.method || "",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const filename = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}_registrations.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
