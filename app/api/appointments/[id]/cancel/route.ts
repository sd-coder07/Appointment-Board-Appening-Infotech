import { NextRequest, NextResponse } from "next/server";
import { appointmentDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await appointmentDb.updateStatus(id, "CANCELLED");

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Appointment cancelled successfully.",
        appointment: result.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PATCH /api/appointments/[id]/cancel error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel appointment." },
      { status: 500 }
    );
  }
}
