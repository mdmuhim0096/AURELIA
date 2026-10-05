import { auth } from "@/auth";
import { cloudinarySignature } from "@/lib/media/cloudinary";
import { fail, fromError, ok } from "@/lib/api";
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) return fail("Authentication required", 401);
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `commerce/reviews/${session.user.id}`;
    const params = { timestamp, folder };
    return ok({ signature: cloudinarySignature(params), timestamp, folder, cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY });
  } catch (error) { return fromError(error, "Unable to create review upload signature"); }
}
