import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { hashToken } from "@/lib/auth/tokens";
import { audit } from "@/lib/auth/audit";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function POST(request) {
  try {
    const parsed = resetPasswordSchema.safeParse(await readJson(request));
    if (!parsed.success) return fail("Invalid password reset request", 400, parsed.error.flatten().fieldErrors);
    await connectDB();
    const user = await User.findOne({ passwordResetTokenHash: hashToken(parsed.data.token), passwordResetExpiresAt: { $gt: new Date() } }).select("+passwordHash +passwordResetTokenHash +passwordResetExpiresAt");
    if (!user) return fail("Password reset link is invalid or expired", 400);
    user.passwordHash = await bcrypt.hash(parsed.data.password, 12); user.passwordChangedAt = new Date(); user.passwordResetTokenHash = null; user.passwordResetExpiresAt = null; user.failedLoginCount = 0; user.lockedUntil = null; await user.save();
    await audit({ actor: user._id, action: "user.password_reset", resourceType: "User", resourceId: user._id });
    return ok({ reset: true });
  } catch (error) { return fromError(error, "Unable to reset password"); }
}
