import { auth } from "@/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Payment from "@/models/Payment";
import WalletTransaction from "@/models/WalletTransaction";
import Refund from "@/models/Refund";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import { fromError, ok } from "@/lib/api";

export async function GET() {
  try {
    const session = await auth();
    requirePermission(session, PERMISSIONS.ANALYTICS_READ);
    await connectDB();
    const now = new Date();
    const thirty = new Date(now.getTime() - 30 * 86400000);
    const [salesAgg, orderCount, customerCount, productCount, refunds, paymentStats, walletAgg, salesTrend, customerGrowth, topProducts, countrySales, categorySales, orderStatuses, funnel] = await Promise.all([
      Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, revenue: { $sum: "$total" }, paidOrders: { $sum: 1 }, averageOrderValue: { $avg: "$total" } } }]),
      Order.countDocuments({}),
      User.countDocuments({}),
      Product.countDocuments({}),
      Refund.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } }, { $sort: { count: -1 } }]),
      Payment.aggregate([{ $group: { _id: { provider: "$provider", status: "$status" }, count: { $sum: 1 }, amount: { $sum: "$amount" } } }, { $sort: { count: -1 } }]),
      WalletTransaction.aggregate([{ $match: { createdAt: { $gte: thirty }, status: "succeeded" } }, { $group: { _id: "$direction", amount: { $sum: "$amount" }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: thirty }, paymentStatus: "paid" } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      User.aggregate([{ $match: { createdAt: { $gte: thirty } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $unwind: "$items" }, { $group: { _id: "$items.product", name: { $first: "$items.name" }, units: { $sum: "$items.quantity" }, revenue: { $sum: "$items.subtotal" } } }, { $sort: { revenue: -1 } }, { $limit: 8 }]),
      Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: "$shippingAddress.country", revenue: { $sum: "$total" }, orders: { $sum: 1 } } }, { $sort: { revenue: -1 } }, { $limit: 10 }]),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } }, { $unwind: "$items" },
        { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "product" } }, { $unwind: "$product" }, { $unwind: "$product.categories" },
        { $lookup: { from: "categories", localField: "product.categories", foreignField: "_id", as: "category" } }, { $unwind: "$category" },
        { $group: { _id: "$category._id", name: { $first: "$category.name" }, revenue: { $sum: "$items.subtotal" }, units: { $sum: "$items.quantity" } } }, { $sort: { revenue: -1 } }, { $limit: 10 }
      ]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AnalyticsEvent.aggregate([{ $match: { createdAt: { $gte: thirty }, event: { $in: ["page_view", "product_view", "add_to_cart", "begin_checkout"] } } }, { $group: { _id: "$event", events: { $sum: 1 }, sessions: { $addToSet: "$sessionId" } } }, { $project: { _id: 1, events: 1, sessions: { $size: "$sessions" } } }])
    ]);
    const totals = salesAgg[0] || { revenue: 0, paidOrders: 0, averageOrderValue: 0 };
    const funnelMap = Object.fromEntries(funnel.map((item) => [item._id, item]));
    const checkoutSessions = Number(funnelMap.begin_checkout?.sessions || 0);
    const conversionRate = checkoutSessions ? (Number(totals.paidOrders || 0) / checkoutSessions) * 100 : 0;
    return ok({
      metrics: { totalSales: totals.revenue, revenue: totals.revenue, paidOrders: totals.paidOrders, orders: orderCount, customers: customerCount, products: productCount, averageOrderValue: totals.averageOrderValue || 0, conversionRate },
      refunds, paymentStats, walletStats: walletAgg, salesTrend, customerGrowth, topProducts, countrySales, categorySales, orderStatuses,
      funnel: { pageViews: funnelMap.page_view || { events: 0, sessions: 0 }, productViews: funnelMap.product_view || { events: 0, sessions: 0 }, addToCart: funnelMap.add_to_cart || { events: 0, sessions: 0 }, beginCheckout: funnelMap.begin_checkout || { events: 0, sessions: 0 }, purchases: totals.paidOrders || 0 }
    });
  } catch (error) { return fromError(error, "Unable to load analytics"); }
}
