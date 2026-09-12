import { z } from "zod";

export const AppointmentInputSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  date: z
    .string({ required_error: "Date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z
    .string({ required_error: "Start time is required" })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:mm 24-hour format"),
  endTime: z
    .string({ required_error: "End time is required" })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in HH:mm 24-hour format"),
});

export type AppointmentInput = z.infer<typeof AppointmentInputSchema>;

export interface AppointmentRecord {
  id: string;
  title: string;
  description: string | null;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

/**
 * Validates whether the end time is strictly after the start time.
 * "10:00" -> "11:00": valid
 * "10:00" -> "10:00": invalid (0 duration)
 * "10:00" -> "09:30": invalid
 */
export function isEndTimeAfterStartTime(startTime: string, endTime: string): boolean {
  return endTime > startTime;
}

/**
 * Core Overlap Logic:
 * Two appointments on the same date overlap if:
 *   newStart < existingEnd AND newEnd > existingStart
 *
 * Rules:
 * - Cancelled appointments do NOT block slots.
 * - Back-to-back appointments (e.g. 10:00-11:00 and 11:00-12:00) do NOT overlap.
 * - If editing an appointment, excludeId prevents the appointment from conflicting with itself.
 */
export function checkIntervalOverlap(
  newStart: string,
  newEnd: string,
  existingStart: string,
  existingEnd: string
): boolean {
  return newStart < existingEnd && newEnd > existingStart;
}

/**
 * Finds if there is any conflicting appointment from an array of existing appointments.
 * Returns the conflicting appointment if found, otherwise null.
 */
export function findConflictingAppointment(
  appointments: AppointmentRecord[],
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): AppointmentRecord | null {
  for (const appt of appointments) {
    // Exclude self when editing
    if (excludeId && appt.id === excludeId) continue;

    // Must be on the same calendar date
    const apptDateStr = typeof appt.date === "string" ? appt.date.slice(0, 10) : "";
    const targetDateStr = date.slice(0, 10);
    if (apptDateStr !== targetDateStr) continue;

    // Cancelled appointments do not block time slots
    if (appt.status === "CANCELLED") continue;

    // Overlap condition
    if (checkIntervalOverlap(startTime, endTime, appt.startTime, appt.endTime)) {
      return appt;
    }
  }

  return null;
}
