import { NextRequest, NextResponse } from "next/server";
import { appointmentDb } from "@/lib/db";
import { AppointmentInputSchema } from "@/lib/appointments";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    // Filtered list for the board display
    const appointments = await appointmentDb.getAll({ date, status, search });

    // Global stats across all appointments (independent of status filter)
    // If a date is selected, stats reflect that date; otherwise overall board stats
    const allForStats = await appointmentDb.getAll(date ? { date } : undefined);
    const stats = {
      total: allForStats.length,
      scheduled: allForStats.filter((a) => a.status === "SCHEDULED").length,
      completed: allForStats.filter((a) => a.status === "COMPLETED").length,
      cancelled: allForStats.filter((a) => a.status === "CANCELLED").length,
    };

    return NextResponse.json(
      { success: true, appointments, stats },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/appointments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve appointments." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const result = await appointmentDb.create({
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
        message: "Appointment created successfully.",
        appointment: result.data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/appointments error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while creating the appointment." },
      { status: 500 }
    );
  }
}
