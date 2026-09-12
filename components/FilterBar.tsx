"use client";

import React from "react";
import { Search, Calendar, Plus, RotateCcw, X, Filter } from "lucide-react";
import { BoardStats } from "./StatsOverview";

interface FilterBarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  onOpenAddModal: () => void;
  onResetSeed: () => void;
  isSeeding: boolean;
  stats?: BoardStats;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedDate,
  onDateChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onResetSeed,
  isSeeding,
  stats,
}) => {
  const statuses = [
    { label: "All", value: "ALL", count: stats?.total },
    { label: "Scheduled", value: "SCHEDULED", count: stats?.scheduled },
    { label: "Completed", value: "COMPLETED", count: stats?.completed },
    { label: "Cancelled", value: "CANCELLED", count: stats?.cancelled },
  ];

  const handleSetToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    onDateChange(today);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-sm space-y-4 mb-6">
      {/* Top row: Search, Reset, Add Button */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search appointments by title or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onResetSeed}
            disabled={isSeeding}
            title="Reset to sample demo appointments"
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin text-indigo-600" : ""}`} />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Appointment</span>
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Bottom row: Date Picker & Status Tabs */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Date:</span>
          </div>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
          {selectedDate && (
            <button
              onClick={() => onDateChange("")}
              className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md font-medium transition-colors cursor-pointer"
            >
              Clear Date
            </button>
          )}
          <button
            onClick={handleSetToday}
            className="text-xs text-slate-600 hover:text-indigo-600 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-md font-medium transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* Status Filter Tabs with Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
          </span>
          {statuses.map((item) => {
            const isActive = selectedStatus === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onStatusChange(item.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                <span>{item.label}</span>
                {typeof item.count === "number" && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
