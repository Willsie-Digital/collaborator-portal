import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";

// Edge-compatible config — no database imports
export default {
  providers: [Discord],
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isPublicPath = nextUrl.pathname === "/";
      if (isPublicPath) return true;
      if (!isLoggedIn) return Response.redirect(new URL("/", nextUrl));
      return true;
    },
  },
} satisfies NextAuthConfig;
