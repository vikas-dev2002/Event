import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const certificate = await db.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true,
          },
        },
        event: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
            venue: true,
            category: true,
            org: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        {
          valid: false,
          code,
          message: "The verification code does not match any issued certificate.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        id: certificate.id,
        verificationCode: certificate.verificationCode,
        issuedAt: certificate.issuedAt,
        user: certificate.user,
        event: certificate.event,
      },
    });
  } catch (error) {
    console.error("Public certificate verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify certificate" },
      { status: 500 }
    );
  }
}
