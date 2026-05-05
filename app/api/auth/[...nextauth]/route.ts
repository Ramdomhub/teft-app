import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";

const handler = NextAuth({
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.xHandle = (profile as any).data?.username ?? null;
        token.xId = (profile as any).data?.id ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).xHandle = token.xHandle;
      (session as any).xId = token.xId;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
