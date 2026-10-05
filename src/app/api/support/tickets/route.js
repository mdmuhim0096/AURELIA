import crypto from "node:crypto";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import SupportTicket from "@/models/SupportTicket";
import ChatConversation from "@/models/ChatConversation";
import ChatMessage from "@/models/ChatMessage";
import { ticketSchema } from "@/lib/validation/commerce";
import { rateLimit, requestKey } from "@/lib/security/rate-limit";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function GET(){try{const session=await auth();if(!session?.user?.id)return fail("Authentication required",401);await connectDB();return ok({items:await SupportTicket.find({user:session.user.id}).populate("assignedTo","name avatar").sort({createdAt:-1}).lean()})}catch(error){return fromError(error,"Unable to load support tickets")}}
export async function POST(request){try{const session=await auth();if(!session?.user?.id)return fail("Authentication required",401);if(!(await rateLimit(requestKey(request,"support-ticket"),{limit:8,windowSeconds:3600})))return fail("Too many support requests",429);const parsed=ticketSchema.safeParse(await readJson(request));if(!parsed.success)return fail("Invalid support request",400,parsed.error.flatten().fieldErrors);await connectDB();const conversation=await ChatConversation.create({user:session.user.id,status:"open"});const ticket=await SupportTicket.create({ticketNumber:`SUP-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,user:session.user.id,subject:parsed.data.subject,category:parsed.data.category,priority:parsed.data.priority,conversation:conversation._id});conversation.ticket=ticket._id;await conversation.save();await ChatMessage.create({conversation:conversation._id,sender:session.user.id,senderRole:"customer",body:parsed.data.message});return ok({ticket,conversation},{status:201})}catch(error){return fromError(error,"Unable to create support ticket")}}
