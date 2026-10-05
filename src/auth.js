import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import "@/models/Role";
import "@/models/Permission";

import { loginSchema } from "@/lib/validation/auth";
import { audit } from "@/lib/auth/audit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);

        if (!parsed.success) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({
          email: parsed.data.email,
        })
          .select("+passwordHash")
          .populate({
            path: "role",
            populate: {
              path: "permissions",
            },
          });

        if (!user || user.status !== "active") {
          return null;
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!valid) {
          user.failedLoginCount += 1;

          if (user.failedLoginCount >= 5) {
            user.lockedUntil = new Date(
              Date.now() + 15 * 60 * 1000
            );
          }

          await user.save();
          return null;
        }

        user.failedLoginCount = 0;
        user.lockedUntil = null;
        user.lastLoginAt = new Date();

        await user.save();

        const role = user.role?.slug || "customer";
        const permissions =
          role === "admin"
            ? ["*"]
            : user.role?.permissions?.map((permission) => permission.key) || [];

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar || null,
          role,
          permissions,
          emailVerified: Boolean(user.emailVerifiedAt),
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role || "customer";
        token.permissions = user.permissions || [];
        token.emailVerified = Boolean(user.emailVerified);
      }

      // Keep authorization data in sync with MongoDB.
      // This makes manually-promoted admins visible immediately to both
      // server-side admin guards and client-side useSession().
      if (token.uid) {
        await connectDB();

        const fresh = await User.findById(token.uid)
          .populate({
            path: "role",
            populate: {
              path: "permissions",
            },
          })
          .lean();

        if (fresh && fresh.status === "active") {
          const role = fresh.role?.slug || "customer";
          const permissions =
            role === "admin"
              ? ["*"]
              : fresh.role?.permissions?.map((permission) => permission.key) || [];

          token.role = role;
          token.permissions = permissions;
          token.emailVerified = Boolean(fresh.emailVerifiedAt);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.role = token.role || "customer";
        session.user.permissions = token.permissions || [];
        session.user.emailVerified = Boolean(token.emailVerified);
      }

      return session;
    },
  },

  events: {
    async signIn({ user }) {
      if (!user?.id) {
        return;
      }

      await audit({
        actor: user.id,
        action: "auth.login",
        resourceType: "User",
        resourceId: user.id,
      });
    },
  },
});
