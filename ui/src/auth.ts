import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || "fwdly-development-auth-secret-32-bytes",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        const apiGatewayUrl =
          process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";

        try {
          // Pass the id_token and profile info verified by NextAuth
          const res = await fetch(`${apiGatewayUrl}/api/v1/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_token: account.id_token,
              email: token.email,
              name: token.name,
              google_id: account.providerAccountId,
              avatar_url: token.picture,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            token.accessToken = data.token;
            token.user = { ...token.user, ...data.user };
          }
        } catch (err) {
          console.error("--> [NextAuth Server] Failed to dispatch to Go:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token.user) {
        session.user = { ...session.user, ...(token.user as object) };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
});
