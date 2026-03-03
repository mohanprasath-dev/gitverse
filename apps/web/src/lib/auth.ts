import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@gitverse/database';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && profile) {
        const githubProfile = profile as {
          login?: string;
          avatar_url?: string;
          bio?: string;
          id?: number;
          followers?: number;
          following?: number;
          public_repos?: number;
          created_at?: string;
        };

        try {
          await prisma.user.upsert({
            where: { githubId: githubProfile.id ?? 0 },
            update: {
              login: githubProfile.login ?? '',
              avatarUrl: githubProfile.avatar_url,
              bio: githubProfile.bio,
              followers: githubProfile.followers ?? 0,
              following: githubProfile.following ?? 0,
              publicRepos: githubProfile.public_repos ?? 0,
              accessToken: account.access_token,
            },
            create: {
              id: user.id!,
              login: githubProfile.login ?? '',
              name: user.name,
              email: user.email,
              avatarUrl: githubProfile.avatar_url,
              bio: githubProfile.bio,
              githubId: githubProfile.id ?? 0,
              followers: githubProfile.followers ?? 0,
              following: githubProfile.following ?? 0,
              publicRepos: githubProfile.public_repos ?? 0,
              accessToken: account.access_token,
              joinedAt: githubProfile.created_at
                ? new Date(githubProfile.created_at)
                : undefined,
            },
          });
        } catch (error) {
          console.error('Error upserting user on sign in:', error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
});
