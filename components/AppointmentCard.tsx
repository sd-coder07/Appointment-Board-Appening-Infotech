"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Edit2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Check,
  Ban,
} from "lucide-react";
import { AppointmentRecord } from "@/lib/appointments";

interface AppointmentCardProps {
  appointment: AppointmentRecord;
  onEdit: (appointment: AppointmentRecord) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  isActionLoading?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onComplete,
  onCancel,
  isActionLoading,
}) => {
  const isScheduled = appointment.status === "SCHEDULED";
  const isCompleted = appointment.status === "COMPLETED";
  const isCancelled = appointment.status === "CANCELLED";

  // Calculate duration
  const calculateDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
    if (totalMinutes <= 0) return null;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const duration = calculateDuration(appointment.startTime, appointment.endTime);

  // Date parsing for modern calendar widget
  const parseDateParts = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return {
        month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        day: String(day).padStart(2, "0"),
        weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
        fullYear: year,
      };
    } catch {
      return { month: "DATE", day: "--", weekday: "---", fullYear: 2026 };
    }
  };

  const dateParts = parseDateParts(appointment.date);

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-white/95 backdrop-blur-md border transition-all duration-300 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_32px_-8px_rgba(79,70,229,0.12)] hover:-translate-y-1 ${
        isCancelled
          ? "border-slate-200/90 bg-white/75"
          : isCompleted
          ? "border-emerald-200/90 hover:border-emerald-300"
          : "border-slate-200/90 hover:border-indigo-300"
      }`}
    >
      {/* Top Accent Gradient Bar */}
      <div
        className={`h-1.5 w-full transition-all duration-300 ${
          isScheduled
            ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
            : isCompleted
            ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500"
            : "bg-gradient-to-r from-rose-300 via-slate-300 to-rose-400"
        }`}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Top Header: Calendar Date Badge + Status Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Calendar Widget Tile */}
          <div className="flex items-center gap-3">
            <div
              className={`flex flex-col items-center justify-center w-12 h-13 rounded-xl border shadow-xs transition-transform group-hover:scale-105 duration-200 ${
                isScheduled
                  ? "bg-gradient-to-b from-indigo-50/80 to-white border-indigo-100 text-indigo-950"
                  : isCompleted
                  ? "bg-gradient-to-b from-emerald-50/80 to-white border-emerald-100 text-emerald-950"
                  : "bg-slate-100/90 border-slate-200 text-slate-500"
              }`}
            >
              <span
                className={`text-[9px] font-black tracking-wider uppercase px-1 rounded-t-sm w-full text-center py-0.5 ${
                  isScheduled
                    ? "bg-indigo-600 text-white"
                    : isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-400 text-white"
                }`}
              >
                {dateParts.month}
              </span>
              <span className="text-base font-black leading-tight mt-0.5">
                {dateParts.day}
              </span>
              <span className="text-[9px] font-medium text-slate-400 leading-none pb-0.5">
                {dateParts.weekday}
              </span>
            </div>

            {/* Time Interval & Duration */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{appointment.startTime}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>{appointment.endTime}</span>
              </div>
              {duration && (
                <span className="inline-block mt-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                  ⏱️ {duration} duration
                </span>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-xs border ${
                isScheduled
                  ? "bg-amber-50 text-amber-800 border-amber-200/90"
                  : isCompleted
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200/90"
                  : "bg-rose-50 text-rose-800 border-rose-200/90"
              }`}
            >
              {isScheduled && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              )}
              {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              {isCancelled && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
              {appointment.status}
            </span>

            {isCancelled && (
              <span className="text-[10px] font-semibold text-slate-400 italic">
                Slot Released
              </span>
            )}
          </div>
        </div>

        {/* Appointment Title */}
        <h3
          className={`text-base font-bold text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-indigo-900 transition-colors ${
            isCancelled ? "line-through text-slate-400" : ""
          }`}
        >
          {appointment.title}
        </h3>

        {/* Description */}
        {appointment.description && (
          <p
            className={`text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4 ${
              isCancelled ? "text-slate-400" : ""
            }`}
          >
            {appointment.description}
          </p>
        )}

        {/* Spacer to push action footer to bottom */}
        <div className="mt-auto" />

        {/* Interactive Action Row */}
        <div className="pt-3.5 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Left info or slot badge */}
          <div className="text-[11px] text-slate-400 font-medium">
            {isScheduled ? (
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Upcoming
              </span>
            ) : isCompleted ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                Concluded
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1">
                <Ban className="w-3 h-3 text-rose-400" />
                Slot Freed
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Edit Button */}
            <button
              onClick={() => onEdit(appointment)}
              disabled={isActionLoading}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              title="Edit appointment details"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            {/* Complete Button */}
            {isScheduled && (
              <button
                onClick={() => onComplete(appointment.id)}
                disabled={isActionLoading}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 text-emerald-700 bg-emerald-50/90 hover:bg-emerald-600 hover:text-white border border-emerald-200/90 hover:border-transparent rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Mark as completed"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Complete</span>
              </button>
            )}

            {/* Cancel Button */}
            {isScheduled && (
              <button
                onClick={() => onCancel(appointment.id)}
                disabled={isActionLoading}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 text-rose-700 bg-rose-50/90 hover:bg-rose-600 hover:text-white border border-rose-200/90 hover:border-transparent rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Cancel appointment and free slot"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
