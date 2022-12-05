import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { loginSchema } from "../../../utils/authValidation";
import { prisma } from "../../../server/db/client";
import { env } from "process";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials) => {
        const cred = await loginSchema.parseAsync(credentials);
        // perform you login logic
        // find out user from db
        const user = await prisma.user.findFirst({
          where: {
            username: cred.username,
          },
        });
        if (!user) {
          return null;
        }
        // if everything is fine
        const isValidPassword = bcrypt.compareSync(
          cred.password,
          user.password
        );
        if (!isValidPassword) {
          return null;
        }
        return {
          id: user.id,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
    newUser: "/login",
    error: "/",
  },
};

export default NextAuth(authOptions);
