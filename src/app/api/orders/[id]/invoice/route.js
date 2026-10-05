import { auth } from "@/auth";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { invoicePdf } from "@/lib/commerce/invoice";

export async function GET(_request, { params }) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Authentication required", { status: 401 });

  const { id } = await params;
  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) return new Response("Order not found", { status: 404 });

  const ownsOrder = String(order.user || "") === session.user.id;
  if (!ownsOrder && !hasPermission(session, PERMISSIONS.ORDERS_READ)) {
    return new Response("Forbidden", { status: 403 });
  }

  const pdf = invoicePdf(order);
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
      "Content-Length": String(pdf.length)
    }
  });
}
