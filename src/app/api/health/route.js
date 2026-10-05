import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await connectDB();
    const state = db.connection.readyState === 1 ? "up" : "degraded";
    return NextResponse.json({ status: "ok", database: state });
  } catch {
    return NextResponse.json({ status: "degraded", database: "down" }, { status: 503 });
  }
}
