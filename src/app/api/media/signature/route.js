import { auth } from "@/auth";
import { hasAnyPermission, PERMISSIONS } from "@/lib/auth/permissions";
import { cloudinarySignature } from "@/lib/media/cloudinary";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function POST(request) { try { const session = await auth(); if (!hasAnyPermission(session, [PERMISSIONS.PRODUCTS_WRITE, PERMISSIONS.SUPPORT_MANAGE])) return fail("Forbidden", 403); const body = await readJson(request); const timestamp = Math.floor(Date.now() / 1000); const folder = String(body.folder || "commerce").replace(/[^a-zA-Z0-9/_-]/g, ""); const params = { timestamp, folder }; return ok({ signature: cloudinarySignature(params), timestamp, folder, cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY }); } catch (error) { return fromError(error, "Unable to create upload signature"); } }
