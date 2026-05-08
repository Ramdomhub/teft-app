import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

const authOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      if (account && profile) {
        token.xHandle = profile?.data?.username ?? null;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.xHandle = token.xHandle ?? null;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
