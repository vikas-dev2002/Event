import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

/**
 * GET /api/certificates/[id]
 * Retrieve a specific certificate by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const certificate = await db.certificate.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            venue: true,
            org: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Check if user owns this certificate (or is admin)
    if (certificate.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ certificate }, { status: 200 });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to fetch certificate",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/certificates/[id]
 * Delete a certificate (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete certificates" },
        { status: 403 }
      );
    }

    const certificate = await db.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    await db.certificate.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Certificate deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting certificate:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to delete certificate",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
