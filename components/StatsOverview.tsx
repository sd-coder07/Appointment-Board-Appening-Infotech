"use client";

import React from "react";
import { Calendar, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react";

export interface BoardStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

interface StatsOverviewProps {
  stats: BoardStats;
  activeStatus: string;
  onSelectStatus: (status: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  activeStatus,
  onSelectStatus,
}) => {
  const cards = [
    {
      label: "Total Appointments",
      value: stats.total,
      statusKey: "ALL",
      icon: Calendar,
      themeColor: "indigo",
      iconBg: "bg-indigo-50 border-indigo-200/80 text-indigo-600",
      accentBar: "from-indigo-500 to-violet-600",
      activeStyle:
        "ring-2 ring-indigo-500/90 bg-white shadow-md shadow-indigo-500/10 border-indigo-300",
    },
    {
      label: "Scheduled",
      value: stats.scheduled,
      statusKey: "SCHEDULED",
      icon: Clock,
      themeColor: "amber",
      iconBg: "bg-amber-50 border-amber-200/80 text-amber-600",
      accentBar: "from-amber-400 to-orange-500",
      activeStyle:
        "ring-2 ring-amber-500/90 bg-white shadow-md shadow-amber-500/10 border-amber-300",
    },
    {
      label: "Completed",
      value: stats.completed,
      statusKey: "COMPLETED",
      icon: CheckCircle2,
      themeColor: "emerald",
      iconBg: "bg-emerald-50 border-emerald-200/80 text-emerald-600",
      accentBar: "from-emerald-400 to-teal-500",
      activeStyle:
        "ring-2 ring-emerald-500/90 bg-white shadow-md shadow-emerald-500/10 border-emerald-300",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      statusKey: "CANCELLED",
      icon: XCircle,
      themeColor: "rose",
      iconBg: "bg-rose-50 border-rose-200/80 text-rose-600",
      accentBar: "from-rose-400 to-rose-600",
      activeStyle:
        "ring-2 ring-rose-500/90 bg-white shadow-md shadow-rose-500/10 border-rose-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatus === card.statusKey;
        return (
          <button
            key={card.label}
            onClick={() => onSelectStatus(card.statusKey)}
            className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-md border transition-all duration-300 text-left cursor-pointer overflow-hidden ${
              isActive
                ? card.activeStyle
                : "border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            {/* Top Indicator bar for active card */}
            {isActive && (
              <span
                className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${card.accentBar}`}
              />
            )}

            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`p-2 rounded-xl border transition-transform duration-200 group-hover:scale-110 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {card.value}
              </span>

              {isActive ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  Active
                </span>
              ) : (
                <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  Filter <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
