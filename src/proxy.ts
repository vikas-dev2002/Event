import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const protectedRoutes = ["/dashboard", "/events/create", "/organized-events", "/certificates", "/admin", "/profile", "/notifications", "/check-in", "/my-registrations", "/announcements", "/complete-profile"];
const authRoutes = ["/login", "/register"];
const organizerRoutes = ["/events/create", "/organized-events", "/check-in", "/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname === "/verification-pending") {
    return NextResponse.next();
  }

  if (authRoutes.some((route) => pathname.startsWith(route)) && isLoggedIn) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = req.auth?.user as any;
    if (user?.profileCompleted === false) {
      return NextResponse.redirect(new URL("/complete-profile", req.url));
    }
    if (user?.role === "ORGANIZER" && !user?.isVerified) {
      return NextResponse.redirect(new URL("/verification-pending", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = req.auth?.user as any;

    if (user?.profileCompleted === false && pathname !== "/complete-profile") {
      return NextResponse.redirect(new URL("/complete-profile", req.url));
    }

    if (user?.profileCompleted !== false && pathname === "/complete-profile") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (user?.role === "ORGANIZER" && !user?.isVerified) {
      if (organizerRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/verification-pending", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
};
