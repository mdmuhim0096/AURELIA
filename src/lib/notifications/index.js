import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";

export async function notifyUser(
  userId,
  { type, title, message, href = "", email = null, metadata = {} }
) {
  await connectDB();

  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    href,
    metadata,
  });

  if (email) {
    try {
      const user = await User.findById(userId)
        .select("email preferences")
        .lean();

      if (user?.email && user?.preferences?.notifications?.email !== false) {
        await sendEmail({ to: user.email, ...email });
      }
    } catch (error) {
      // Notification creation and payment processing must never fail because
      // an external email provider is unavailable.
      console.error("[notification:email:error]", {
        userId: String(userId),
        type,
        message: error?.message,
      });
    }
  }

  return notification;
}
