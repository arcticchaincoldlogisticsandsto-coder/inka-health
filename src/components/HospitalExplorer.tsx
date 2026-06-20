import React, { useState } from "react";
import { Hospital } from "../types";
import { Landmark, MapPin, BadgePercent, Clock, CircleAlert, Waves, Sparkles } from "lucide-react";
import { formatTzs } from "../utils";

interface HospitalExplorerProps {
  hospitals: Hospital[];
  onSelectHospitalScan: (hospitalId: string, scanType: "MRI" | "CT" | "X-Ray") => void;
}

export default function HospitalExplorer({ hospitals, onSelectHospitalScan }: HospitalExplorerProps) {
  const [filterScan, setFilterScan] = useState<"All" | "MRI" | "CT" | "X-Ray">("All");

  return (
    <div id="hospital-explorer-pane" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
            <Sparkles className="h-3.5 w-3.5" /> Direct Referral Marketplace
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">Tanzanian Radiology Explorer</h2>
          <p className="text-xs text-slate-500 mt-1">
            Compare medical scan pricing in Dar es Salaam. Choose off-peak times (e.g. night vacancies) to receive up to <strong>40% TZS</strong> regulatory discounts.
          </p>
        </div>

        {/* Scan Filters */}
        <div className="flex flex-wrap gap-1.5 self-center">
          {(["All", "MRI", "CT", "X-Ray"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterScan(type)}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer ${
                filterScan === type
                  ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {hospitals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 text-xs mt-3">Fetching region diagnostic registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((h) => {
            // Get diagnostic scopes
            const scanMap = h.scans;
            const availableScans = Object.keys(scanMap) as Array<"MRI" | "CT" | "X-Ray">;
            const meetsFilter = filterScan === "All" || availableScans.includes(filterScan as any);

            if (!meetsFilter) return null;

            return (
              <div
                key={h.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Hospital Brand Header */}
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-slate-150 bg-slate-50 p-2.5 text-indigo-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors shrink-0">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 group-hover:text-indigo-900 transition-colors">{h.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                        <MapPin className="h-3 w-3 text-red-500" />
                        <span>{h.location}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-550 font-sans leading-relaxed min-h-[36px]">{h.details}</p>

                  {/* Off-peak Highlight info */}
                  <div className="rounded-xl bg-slate-50 border border-slate-150 p-3 flex gap-2 items-center">
                    <Clock className="h-4 w-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Discount Window</div>
                      <div className="text-xs font-semibold text-slate-700">
                        {h.offPeakHours} <span className="text-emerald-600 font-bold ml-1">(-40% TZS)</span>
                      </div>
                    </div>
                  </div>

                  {/* Available Services pricing section */}
                  <div className="space-y-2 border-t border-slate-100 pt-3.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Scans & Pricing Schedules</span>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.keys(h.scans).map((scanKey) => {
                        if (filterScan !== "All" && scanKey !== filterScan) return null;
                        const rates = h.scans[scanKey];
                        return (
                          <div
                            key={scanKey}
                            className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-150 p-2.5 text-xs"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                              <span className="font-mono text-slate-700 font-bold">{scanKey}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-slate-400 text-[10px]" title="Standard Day Shift Rate">
                                {formatTzs(rates.standardTzs)}
                              </div>
                              <div className="text-indigo-600 font-bold text-[11px] font-mono flex items-center justify-end gap-1" title="Special Night Shift Rate">
                                <BadgePercent className="h-3.5 w-3.5 text-indigo-505" /> {formatTzs(rates.offPeakTzs)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Dispatch Scheduling button */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <div className="flex gap-1.5 items-center">
                    <button
                      onClick={() => onSelectHospitalScan(h.id, filterScan === "All" ? "MRI" : filterScan)}
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-550 py-2.5 text-xs text-center text-white font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-600/10"
                    >
                      Book Vacancy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
