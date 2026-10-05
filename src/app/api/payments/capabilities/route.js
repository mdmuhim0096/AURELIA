import { paymentCapabilities } from "@/lib/payments";
import { ok } from "@/lib/api";
export async function GET() { return ok({ providers: { ...paymentCapabilities(), wallet: true } }); }
