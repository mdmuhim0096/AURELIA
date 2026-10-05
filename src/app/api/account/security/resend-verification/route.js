import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createOpaqueToken } from "@/lib/auth/tokens";
import { sendEmail, emailTemplates } from "@/lib/email";
import { rateLimit } from "@/lib/security/rate-limit";
import { fail, fromError, ok } from "@/lib/api";
export async function POST(){try{const session=await auth();if(!session?.user?.id)return fail("Authentication required",401);if(!(await rateLimit(`verify-resend:${session.user.id}`,{limit:3,windowSeconds:3600})))return fail("Too many verification emails requested",429);await connectDB();const user=await User.findById(session.user.id).select("name email emailVerifiedAt +emailVerificationTokenHash +emailVerificationExpiresAt");if(!user)return fail("Account not found",404);if(user.emailVerifiedAt)return ok({verified:true});const{token,hash}=createOpaqueToken();user.emailVerificationTokenHash=hash;user.emailVerificationExpiresAt=new Date(Date.now()+24*60*60*1000);await user.save();const result=await sendEmail({to:user.email,...emailTemplates.verifyEmail(user.name,token)});return ok({sent:Boolean(result.sent),verificationRequired:true})}catch(error){return fromError(error,"Unable to resend verification email")}}
