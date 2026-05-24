import { createHmac, timingSafeEqual } from "node:crypto";
import type { Organization, Role, User } from "@prisma/client";

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

type MobileTokenType = "access" | "refresh";

export interface MobileTokenPayload {
  sub: string;
  email: string;
  role: Role;
  orgId: string | null;
  type: MobileTokenType;
  iat: number;
  exp: number;
  isVerified: boolean;
  profileCompleted: boolean;
}

export type MobileAuthUser = Pick<
  User,
  | "id"
  | "email"
  | "name"
  | "role"
  | "department"
  | "year"
  | "phone"
  | "interests"
  | "avatarUrl"
  | "orgId"
  | "isVerified"
  | "profileCompleted"
> & {
  org?: Pick<Organization, "id" | "name" | "slug" | "logo"> | null;
};

function getMobileJwtSecret() {
  const secret = process.env.MOBILE_JWT_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("Missing MOBILE_JWT_SECRET or NEXTAUTH_SECRET");
  }

  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value: string) {
  return createHmac("sha256", getMobileJwtSecret())
    .update(value)
    .digest("base64url");
}

function createToken(user: MobileAuthUser, type: MobileTokenType, ttlSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId ?? null,
      type,
      iat: now,
      exp: now + ttlSeconds,
      isVerified: user.isVerified,
      profileCompleted: user.profileCompleted,
    } satisfies MobileTokenPayload)
  );
  const signature = signValue(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
}

export function createAccessToken(user: MobileAuthUser) {
  return createToken(user, "access", ACCESS_TOKEN_TTL_SECONDS);
}

export function createRefreshToken(user: MobileAuthUser) {
  return createToken(user, "refresh", REFRESH_TOKEN_TTL_SECONDS);
}

export function verifyMobileToken(
  token: string,
  expectedType?: MobileTokenType
): MobileTokenPayload | null {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      return null;
    }

    const expectedSignature = signValue(`${encodedHeader}.${encodedPayload}`);
    const actualBuffer = Buffer.from(encodedSignature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return null;
    }

    const header = JSON.parse(base64UrlDecode(encodedHeader)) as {
      alg?: string;
      typ?: string;
    };

    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as MobileTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) {
      return null;
    }

    if (expectedType && payload.type !== expectedType) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getBearerTokenFromHeader(headerValue: string | null) {
  if (!headerValue?.startsWith("Bearer ")) {
    return null;
  }

  const token = headerValue.slice("Bearer ".length).trim();
  return token || null;
}

export function serializeMobileUser(user: MobileAuthUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    year: user.year,
    phone: user.phone,
    interests: user.interests,
    avatarUrl: user.avatarUrl,
    orgId: user.orgId,
    org: user.org
      ? {
          id: user.org.id,
          name: user.org.name,
          slug: user.org.slug,
          logo: user.org.logo,
        }
      : null,
    isVerified: user.isVerified,
    profileCompleted: user.profileCompleted,
  };
}

export function buildMobileAuthResponse(user: MobileAuthUser) {
  return {
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user),
    user: serializeMobileUser(user),
  };
}
