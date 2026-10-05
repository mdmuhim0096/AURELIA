import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Role from "@/models/Role";
import { registerSchema } from "@/lib/validation/auth";
import { createOpaqueToken } from "@/lib/auth/tokens";
import { audit } from "@/lib/auth/audit";
import { emailTemplates, sendEmail } from "@/lib/email";
import { rateLimit, requestKey } from "@/lib/security/rate-limit";
import { fail, fromError, ok, readJson } from "@/lib/api";

export async function POST(request) {
  try {
    // Rate limit registration attempts
    if (
      !(await rateLimit(requestKey(request, "register"), {
        limit: 6,
        windowSeconds: 300,
      }))
    ) {
      return fail("Too many registration attempts", 429);
    }

    // Validate request body
    const parsed = registerSchema.safeParse(await readJson(request));

    if (!parsed.success) {
      return fail(
        "Invalid registration data",
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    await connectDB();

    // Check existing user
    const existingUser = await User.exists({
      email: parsed.data.email,
    });

    if (existingUser) {
      return fail(
        "Unable to create account with those details",
        409
      );
    }

    // --------------------------------------------------
    // DEFAULT ROLE
    // --------------------------------------------------

    const role = await Role.findOneAndUpdate(
      { slug: "customer" },
      {
        $setOnInsert: {
          name: "Customer",
          slug: "customer",
          isSystem: true,
        },
      },
      { new: true, upsert: true }
    );

    // --------------------------------------------------
    // EMAIL VERIFICATION TOKEN
    // --------------------------------------------------

    const { token, hash } = createOpaqueToken();

    // --------------------------------------------------
    // CREATE USER
    // --------------------------------------------------

    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,

      passwordHash: await bcrypt.hash(
        parsed.data.password,
        12
      ),

      // Customer role automatically assigned here
      role: role._id,

      marketingOptIn:
        parsed.data.marketingOptIn ?? false,

      emailVerificationTokenHash: hash,

      emailVerificationExpiresAt: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ),
    });

    // --------------------------------------------------
    // AUDIT + VERIFICATION EMAIL
    // --------------------------------------------------

    await Promise.allSettled([
      audit({
        actor: user._id,
        action: "user.registered",
        resourceType: "User",
        resourceId: user._id,
        newValue: {
          email: user.email,
          role: "customer",
        },
      }),

      sendEmail({
        to: user.email,
        ...emailTemplates.verifyEmail(
          user.name,
          token
        ),
      }),
    ]);

    return ok(
      {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
        },

        verificationRequired: true,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return fromError(
      error,
      "Unable to create account"
    );
  }
}