"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, AlertCircle, Check } from "lucide-react";
import { AppointmentRecord } from "@/lib/appointments";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => Promise<{ success: boolean; error?: string }>;
  appointmentToEdit?: AppointmentRecord | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  appointmentToEdit,
}) => {
  const isEditing = !!appointmentToEdit;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when opening or switching appointmentToEdit
  useEffect(() => {
    if (appointmentToEdit) {
      setTitle(appointmentToEdit.title);
      setDescription(appointmentToEdit.description || "");
      setDate(appointmentToEdit.date.slice(0, 10));
      setStartTime(appointmentToEdit.startTime);
      setEndTime(appointmentToEdit.endTime);
    } else {
      // Default new appointment values
      setTitle("");
      setDescription("");
      const today = new Date().toISOString().slice(0, 10);
      setDate(today);
      setStartTime("10:00");
      setEndTime("11:00");
    }
    setErrors({});
    setServerError(null);
  }, [appointmentToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required.";
    }

    if (!date) {
      newErrors.date = "Date is required.";
    }

    if (!startTime) {
      newErrors.startTime = "Start time is required.";
    }

    if (!endTime) {
      newErrors.endTime = "End time is required.";
    }

    if (startTime && endTime && endTime <= startTime) {
      newErrors.endTime = "End time must be after start time.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        title: title.trim(),
        description: description.trim(),
        date,
        startTime,
        endTime,
      });

      if (!result.success) {
        setServerError(result.error || "An error occurred.");
      } else {
        onClose();
      }
    } catch (err: any) {
      setServerError(err.message || "Failed to save appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? "Edit Appointment" : "Add New Appointment"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? "Update appointment details and save changes"
                : "Schedule a new meeting or team discussion"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Server / Conflict Error Banner */}
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium leading-relaxed animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{serverError}</div>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Team Meeting, Architecture Review..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.title
                  ? "border-rose-300 focus:ring-rose-500 bg-rose-50/30"
                  : "border-slate-200 focus:ring-indigo-500 focus:bg-white"
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide agenda, notes, or discussion points..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
            />
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: "" }));
                }}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 cursor-pointer ${
                  errors.date
                    ? "border-rose-300 focus:ring-rose-500 bg-rose-50/30"
                    : "border-slate-200 focus:ring-indigo-500 focus:bg-white"
                }`}
              />
            </div>
            {errors.date && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.date}</p>
            )}
          </div>

          {/* Time Fields (Start & End) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (errors.startTime || errors.endTime) {
                    setErrors((prev) => ({ ...prev, startTime: "", endTime: "" }));
                  }
                }}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 cursor-pointer ${
                  errors.startTime
                    ? "border-rose-300 focus:ring-rose-500 bg-rose-50/30"
                    : "border-slate-200 focus:ring-indigo-500 focus:bg-white"
                }`}
              />
              {errors.startTime && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: "" }));
                }}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 cursor-pointer ${
                  errors.endTime
                    ? "border-rose-300 focus:ring-rose-500 bg-rose-50/30"
                    : "border-slate-200 focus:ring-indigo-500 focus:bg-white"
                }`}
              />
              {errors.endTime && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Save Changes" : "Create Appointment"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
