import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    newUser: "/complete-profile",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session.user as any;
        user.id = token.id;
        user.role = token.role;
        user.department = token.department;
        user.isVerified = token.isVerified;
        user.profileCompleted = token.profileCompleted;
      }
      return session;
    },
  },
};

export default authConfig;
