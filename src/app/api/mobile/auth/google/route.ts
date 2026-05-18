import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildMobileAuthResponse } from "@/lib/mobile-auth";
import { asMobileAuthUser, currentUserSelect } from "@/lib/current-user";
import { resolveOrgFromEmail } from "@/lib/resolve-org";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

export async function POST(request: NextRequest) {
  try {
    if (!googleClient || !googleClientId) {
      return NextResponse.json({ error: "Google sign-in is not configured on the server." }, { status: 500 });
    }

    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "Google ID token is required." }, { status: 400 });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      return NextResponse.json({ error: "Unable to verify the Google account." }, { status: 401 });
    }

    const email = payload.email.toLowerCase();
    let user = await db.user.findUnique({
      where: { email },
      select: currentUserSelect,
    });

    if (!user) {
      const resolved = await resolveOrgFromEmail(email);
      user = await db.user.create({
        data: {
          email,
          name: payload.name || email.split("@")[0],
          avatarUrl: payload.picture || null,
          emailVerified: new Date(),
          profileCompleted: false,
          role: "STUDENT",
          isVerified: true,
          orgId: resolved?.orgId ?? undefined,
        },
        select: currentUserSelect,
      });
    } else {
      if (user.role === "ORGANIZER" && !user.isVerified) {
        return NextResponse.json(
          { error: "Your organizer account is pending verification. Please wait for admin approval." },
          { status: 403 }
        );
      }

      user = await db.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: payload.picture || user.avatarUrl,
          emailVerified: new Date(),
        },
        select: currentUserSelect,
      });
    }

    await db.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: payload.sub,
        },
      },
      create: {
        userId: user.id,
        type: "oauth",
        provider: "google",
        providerAccountId: payload.sub,
        id_token: idToken,
        access_token: null,
      },
      update: {
        userId: user.id,
        id_token: idToken,
      },
    });

    return NextResponse.json(buildMobileAuthResponse(asMobileAuthUser(user)));
  } catch (error) {
    console.error("Mobile Google auth error:", error);
    return NextResponse.json({ error: "Google sign-in failed" }, { status: 500 });
  }
}
