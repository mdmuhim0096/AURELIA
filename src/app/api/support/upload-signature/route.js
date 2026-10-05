import { auth } from "@/auth";
import { cloudinarySignature } from "@/lib/media/cloudinary";
import { fail, fromError, ok } from "@/lib/api";
export async function POST() { try { const session = await auth(); if (!session?.user?.id) return fail("Authentication required", 401); const timestamp = Math.floor(Date.now()/1000); const folder = `commerce/support/${session.user.id}`; return ok({ signature: cloudinarySignature({ timestamp, folder }), timestamp, folder, cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY }); } catch (error) { return fromError(error, "Support uploads are not configured"); } }
