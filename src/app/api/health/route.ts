import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.user.count();
    return NextResponse.json({
      status: "ok",
      db: "ok",
      time: Date.now(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        status: "degraded",
        db: "error",
        time: Date.now(),
        error: e instanceof Error ? e.message : "unknown",
      },
      { status: 503 }
    );
  }
}
