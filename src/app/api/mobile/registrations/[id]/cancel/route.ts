import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import {
  sendRegistrationCancellation,
  sendRegistrationConfirmation,
} from "@/lib/email";
import { promoteFromWaitlist } from "@/lib/waitlist";

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

    const registration = await db.registration.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            organizerId: true,
            org: { select: { name: true } },
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    if (registration.userId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to cancel this registration" },
        { status: 403 }
      );
    }

    if (registration.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Registration is already cancelled" },
        { status: 400 }
      );
    }

    const wasConfirmed = registration.status === "CONFIRMED";

    await db.registration.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    await db.attendance.deleteMany({
      where: { registrationId: id },
    });

    let promoted: Awaited<ReturnType<typeof promoteFromWaitlist>> = null;
    if (wasConfirmed) {
      promoted = await promoteFromWaitlist(registration.event.id);
    }

    if (promoted) {
      try {
        await db.notification.create({
          data: {
            type: "REGISTRATION_CONFIRMED",
            title: "You're off the waitlist!",
            message: `A spot opened up for "${promoted.event.title}" — your seat is now confirmed.`,
            userId: promoted.userId,
            link: "/my-registrations",
          },
        });
      } catch (notificationError) {
        console.error("Promotion notification error:", notificationError);
      }

      try {
        await sendRegistrationConfirmation(
          promoted.user.email,
          promoted.user.name || "User",
          promoted.event.title,
          {
            startDate: promoted.event.startDate,
            endDate: promoted.event.endDate,
            venue: promoted.event.venue,
            category: promoted.event.category,
          },
          promoted.event.org?.name,
          { wasPromoted: true }
        );
      } catch (emailError) {
        console.error("Promotion email error:", emailError);
      }
    }

    try {
      await db.notification.create({
        data: {
          type: "GENERAL",
          title: "Registration Cancelled",
          message: `${user.name} cancelled their registration for "${registration.event.title}"`,
          userId: registration.event.organizerId,
          link: `/organized-events/${registration.event.id}/students`,
        },
      });
    } catch (notificationError) {
      console.error("Organizer notification error:", notificationError);
    }

    try {
      await sendRegistrationCancellation(
        user.email,
        user.name || "User",
        registration.event.title,
        registration.event.org?.name
      );
    } catch (emailError) {
      console.error("Cancellation email error:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Mobile registration cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}
