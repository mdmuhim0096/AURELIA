import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyEmailSchema } from "@/lib/validation/auth";
import { hashToken } from "@/lib/auth/tokens";
import { audit } from "@/lib/auth/audit";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function POST(request) {
  try {
    const parsed = verifyEmailSchema.safeParse(await readJson(request));
    if (!parsed.success) return fail("Invalid verification token", 400);
    await connectDB();
    const user = await User.findOne({ emailVerificationTokenHash: hashToken(parsed.data.token), emailVerificationExpiresAt: { $gt: new Date() } }).select("+emailVerificationTokenHash +emailVerificationExpiresAt");
    if (!user) return fail("Verification link is invalid or expired", 400);
    user.emailVerifiedAt = new Date(); user.emailVerificationTokenHash = null; user.emailVerificationExpiresAt = null; await user.save();
    await audit({ actor: user._id, action: "user.email_verified", resourceType: "User", resourceId: user._id });
    return ok({ verified: true });
  } catch (error) { return fromError(error, "Unable to verify email"); }
}
