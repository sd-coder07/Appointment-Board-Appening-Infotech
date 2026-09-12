import { NextResponse } from "next/server";
import { appointmentDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const seeded = await appointmentDb.resetAndSeed();
    return NextResponse.json(
      {
        success: true,
        message: "Sample appointments seeded successfully.",
        appointments: seeded,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset and seed sample appointments." },
      { status: 500 }
    );
  }
}
