import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Shipment from "@/models/Shipment";
import Refund from "@/models/Refund";
import ReturnRequest from "@/models/Return";
import { fail, fromError, ok } from "@/lib/api";
export async function GET(_request,{params}){try{const session=await auth();if(!session?.user?.id)return fail("Authentication required",401);const{id}=await params;await connectDB();const order=await Order.findOne({_id:id,user:session.user.id}).lean();if(!order)return fail("Order not found",404);const[shipment,refunds,returns]=await Promise.all([Shipment.findOne({order:order._id}).lean(),Refund.find({order:order._id}).sort({createdAt:-1}).lean(),ReturnRequest.find({order:order._id,user:session.user.id}).sort({createdAt:-1}).lean()]);return ok({order,shipment,refunds,returns})}catch(error){return fromError(error,"Unable to load order")}}
