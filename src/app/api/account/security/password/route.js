import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { audit } from "@/lib/auth/audit";
import { sendEmail, emailTemplates } from "@/lib/email";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function POST(request){try{const session=await auth();if(!session?.user?.id)return fail("Authentication required",401);const{currentPassword,newPassword}=await readJson(request);if(!currentPassword||!newPassword||String(newPassword).length<8)return fail("A valid current and new password are required",400);await connectDB();const user=await User.findById(session.user.id).select("+passwordHash email name");if(!user||!(await bcrypt.compare(currentPassword,user.passwordHash)))return fail("Current password is incorrect",400);user.passwordHash=await bcrypt.hash(newPassword,12);user.passwordChangedAt=new Date();await user.save();await audit({actor:user._id,action:"user.password_changed",resourceType:"User",resourceId:user._id});await sendEmail({to:user.email,...emailTemplates.security("Your password was changed","Your account password was changed. If this was not you, contact support immediately.")}).catch(()=>{});return ok({changed:true})}catch(error){return fromError(error,"Unable to change password")}}
