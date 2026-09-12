import { NextRequest, NextResponse } from "next/server";
import { appointmentDb } from "@/lib/db";
import { AppointmentInputSchema } from "@/lib/appointments";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const appointment = await appointmentDb.getById(id);

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, appointment }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/appointments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve appointment." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = AppointmentInputSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue.message },
        { status: 400 }
      );
    }

    const { title, description, date, startTime, endTime } = parsed.data;
    const result = await appointmentDb.update(id, {
      title,
      description,
      date,
      startTime,
      endTime,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Appointment updated successfully.",
        appointment: result.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/appointments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while updating the appointment." },
      { status: 500 }
    );
  }
}
