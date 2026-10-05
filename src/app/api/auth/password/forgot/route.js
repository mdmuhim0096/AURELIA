import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requestPasswordResetSchema } from "@/lib/validation/auth";
import { createOpaqueToken } from "@/lib/auth/tokens";
import { sendEmail, emailTemplates } from "@/lib/email";
import { rateLimit, requestKey } from "@/lib/security/rate-limit";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function POST(request) {
  try {
    if (!(await rateLimit(requestKey(request, "forgot-password"), { limit: 5, windowSeconds: 600 }))) return fail("Too many attempts", 429);
    const parsed = requestPasswordResetSchema.safeParse(await readJson(request));
    if (!parsed.success) return fail("Enter a valid email address", 400);
    await connectDB();
    const user = await User.findOne({ email: parsed.data.email });
    if (user) {
      const { token, hash } = createOpaqueToken();
      user.passwordResetTokenHash = hash; user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000); await user.save();
      await sendEmail({ to: user.email, ...emailTemplates.passwordReset(user.name, token) });
    }
    return ok({ message: "If the account exists, a password reset email has been sent." });
  } catch (error) { return fromError(error, "Unable to process password reset"); }
}
