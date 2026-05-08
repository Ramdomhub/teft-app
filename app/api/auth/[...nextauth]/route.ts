import NextAuth from "next-auth";

const authOptions = {
  providers: [
    {
      id: "twitter",
      name: "X",
      type: "oauth",
      version: "2.0",
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      authorization: {
        url: "https://x.com/i/oauth2/authorize",
        params: {
          scope: "users.read tweet.read offline.access",
        },
      },
      token: "https://api.x.com/2/oauth2/token",
      userinfo: {
        url: "https://api.x.com/2/users/me",
        params: { "user.fields": "username,profile_image_url" },
      },
      checks: ["pkce", "state"],
      profile(profile: any) {
        return {
          id: profile.data.id,
          name: profile.data.name,
          email: null,
          image: profile.data.profile_image_url,
        };
      },
    },
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

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
