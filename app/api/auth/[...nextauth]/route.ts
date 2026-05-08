import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

const authOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
      authorization: {
        url: "https://x.com/i/oauth2/authorize",
        params: {
          scope: "users.read tweet.read offline.access",
        },
      },
      token: "https://api.x.com/2/oauth2/token",
      userinfo: "https://api.x.com/2/users/me?user.fields=profile_image_url",
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
