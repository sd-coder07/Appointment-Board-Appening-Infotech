"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Sparkles,
  Inbox,
  AlertTriangle,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";
import { AppointmentRecord } from "@/lib/appointments";
import { StatsOverview, BoardStats } from "@/components/StatsOverview";
import { FilterBar } from "@/components/FilterBar";
import { AppointmentCard } from "@/components/AppointmentCard";
import { AppointmentModal } from "@/components/AppointmentModal";
import { ToastContainer, ToastMessage } from "@/components/Toast";

export default function AppointmentBoardPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [stats, setStats] = useState<BoardStats>({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  });
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentRecord | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch appointments with active filters
  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedDate) params.set("date", selectedDate);
      if (selectedStatus && selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/appointments?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        addToast(data.error || "Failed to load appointments.", "error");
      }
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      addToast("Network error while loading appointments.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedStatus, searchQuery, addToast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle Add / Edit Submission
  const handleModalSubmit = async (formData: {
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const isEditing = !!appointmentToEdit;
      const url = isEditing
        ? `/api/appointments/${appointmentToEdit.id}`
        : "/api/appointments";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to save appointment." };
      }

      addToast(
        isEditing
          ? "Appointment updated successfully."
          : "Appointment created successfully.",
        "success"
      );
      await fetchAppointments();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error occurred." };
    }
  };

  // Complete Appointment
  const handleComplete = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/complete`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        addToast(data.error || "Failed to complete appointment.", "error");
      } else {
        addToast("Appointment marked as completed.", "success");
        await fetchAppointments();
      }
    } catch (err: any) {
      addToast("Network error while completing appointment.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cancel Appointment
  const handleCancel = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        addToast(data.error || "Failed to cancel appointment.", "error");
      } else {
        addToast("Appointment cancelled successfully.", "success");
        await fetchAppointments();
      }
    } catch (err: any) {
      addToast("Network error while cancelling appointment.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reset demo seed data
  const handleResetSeed = async () => {
    if (!window.confirm("Reset appointment board to initial demo sample appointments?")) {
      return;
    }
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        addToast("Sample appointments seeded successfully.", "success");
        setSelectedDate("");
        setSelectedStatus("ALL");
        setSearchQuery("");
        await fetchAppointments();
      } else {
        addToast(data.error || "Failed to reset sample appointments.", "error");
      }
    } catch (err: any) {
      addToast("Network error resetting sample appointments.", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent pb-16">
      {/* Top Navigation Banner */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl shadow-sm text-white">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Appointment Board
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                  Full Stack Task
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Team Meeting & Schedule Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Interval Overlap Guard Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Metric Statistics */}
        <StatsOverview
          stats={stats}
          activeStatus={selectedStatus}
          onSelectStatus={(st) => setSelectedStatus(st)}
        />

        {/* Filter Controls & Search */}
        <FilterBar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddModal={() => {
            setAppointmentToEdit(null);
            setIsModalOpen(true);
          }}
          onResetSeed={handleResetSeed}
          isSeeding={isSeeding}
          stats={stats}
        />

        {/* Board Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
            <div className="p-3 bg-slate-100 rounded-2xl mb-4 text-slate-400">
              <Inbox className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No appointments found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-5">
              {selectedDate || selectedStatus !== "ALL" || searchQuery
                ? "No appointments match your active search or filter criteria. Try clearing filters or creating a new appointment."
                : "Your appointment board is currently empty. Click Add Appointment or seed demo appointments to get started."}
            </p>
            <div className="flex items-center gap-3">
              {(selectedDate || selectedStatus !== "ALL" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedDate("");
                    setSelectedStatus("ALL");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => {
                  setAppointmentToEdit(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
              >
                + Add Appointment
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onEdit={(item) => {
                  setAppointmentToEdit(item);
                  setIsModalOpen(true);
                }}
                onComplete={handleComplete}
                onCancel={handleCancel}
                isActionLoading={actionLoadingId === appt.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAppointmentToEdit(null);
        }}
        onSubmit={handleModalSubmit}
        appointmentToEdit={appointmentToEdit}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}
