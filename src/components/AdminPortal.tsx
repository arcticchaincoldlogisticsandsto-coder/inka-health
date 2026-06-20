import React, { useState } from "react";
import { Doctor, Booking, Referral } from "../types";
import { formatTzs } from "../utils";
import { Shield, Users, FileSignature, DollarSign, BrainCircuit, CheckSquare, Trash2, ShieldCheck, AlertTriangle } from "lucide-react";

interface AdminPortalProps {
  doctors: Doctor[];
  bookings: Booking[];
  referrals: Referral[];
  onVerifyDoctor: (doctorId: string) => void;
  onResetDb: () => void;
}

export default function AdminPortal({
  doctors,
  bookings,
  referrals,
  onVerifyDoctor,
  onResetDb,
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<"doctors" | "bookings" | "referrals">("doctors");

  // Sum calculations
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + b.finalPrice, 0);

  const totalPoints = doctors.reduce((sum, d) => sum + d.inkaPoints, 0);
  const pendingDoctors = doctors.filter((d) => d.status === "Pending").length;

  return (
    <div className="space-y-6 text-slate-800 font-sans" id="admin-portal-dashboard">
      {/* Overview stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Total Clinicians</span>
            <div className="mt-1 text-2xl font-black font-mono text-slate-850">{doctors.length}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">{pendingDoctors} pending vetting</p>
          </div>
          <div className="rounded-xl bg-purple-50 p-2 text-purple-650">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Metric Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Active Referrals</span>
            <div className="mt-1 text-2xl font-black font-mono text-slate-850">{referrals.length}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Cryptographically signed</p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-650">
            <FileSignature className="h-5 w-5" />
          </div>
        </div>

        {/* Metric Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Total TZS Revenue</span>
            <div className="mt-1 text-lg font-black font-mono text-indigo-700">{formatTzs(totalRevenue)}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Liveness Protected</p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Metric Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">InkaPoints Ledger</span>
            <div className="mt-1 text-2xl font-black font-mono text-slate-850">{totalPoints}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">PDPC zero-linkage compliant</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
            <BrainCircuit className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Compliance / Reseed Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2.5 text-xs">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-slate-650">
            <span className="font-bold text-slate-850 uppercase font-mono">Tanzanian Health Regulatory Audit Mode:</span>{" "}
            Active. All referrals checked against standard regex <code className="font-mono text-xs px-1 rounded bg-slate-150">{"/^MCT[0-9]{5,7}$/"}</code> format.
          </div>
        </div>
        <button
          onClick={onResetDb}
          className="rounded-xl bg-red-50 hover:bg-red-100 transition-all px-3.5 py-2 text-xs text-red-700 border border-red-200 font-bold flex items-center gap-1.5 self-start md:self-auto shrink-0 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" /> Reset Mock Data
        </button>
      </div>

      {/* Admin Tabbed Control Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 bg-slate-50 px-5">
          <button
            onClick={() => setActiveTab("doctors")}
            className={`border-b-2 py-4 text-xs font-bold uppercase tracking-wider transition-all mr-6 cursor-pointer ${
              activeTab === "doctors"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-450 hover:text-slate-800"
            }`}
          >
            MCT Doctor Roster ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab("referrals")}
            className={`border-b-2 py-4 text-xs font-bold uppercase tracking-wider transition-all mr-6 cursor-pointer ${
              activeTab === "referrals"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-450 hover:text-slate-800"
            }`}
          >
            Signed Referrals ({referrals.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`border-b-2 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "bookings"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-450 hover:text-slate-800"
            }`}
          >
            Bookings & Liveness Audits ({bookings.length})
          </button>
        </div>

        {/* Content Tabs */}
        <div className="p-6">
          {activeTab === "doctors" && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Medical Council of Tanzania (MCT) Roster</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                      <th className="py-2.5">Clinician Name</th>
                      <th className="py-2.5">Email Handle</th>
                      <th className="py-2.5">MCT Reference</th>
                      <th className="py-2.5">Auth Status</th>
                      <th className="py-2.5 text-right">InkaPoints Bal</th>
                      <th className="py-2.5 text-right">Corporate Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-650">
                    {doctors.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-900">{d.name}</td>
                        <td className="py-3 font-mono text-slate-500">{d.email}</td>
                        <td className="py-3 font-mono font-semibold text-slate-800">{d.mctNumber}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-2xs font-bold font-mono uppercase tracking-wider ${
                              d.status === "Verified"
                                ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200"
                                : "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-amber-800 font-bold">{d.inkaPoints} pts</td>
                        <td className="py-3 text-right">
                          {d.status === "Pending" ? (
                            <button
                              onClick={() => onVerifyDoctor(d.id)}
                              className="rounded bg-indigo-600 hover:bg-indigo-550 px-2.5 py-1 text-[10px] text-white font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              Verify & Sign Onboard
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono font-semibold">Vetted & Approved ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "referrals" && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Issued Radiographical Referrals Ledger</h3>
              {referrals.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">No active referrals recorded on network.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-450">
                        <th className="py-2.5">Referral Code</th>
                        <th className="py-2.5">Referring Physician</th>
                        <th className="py-2.5">Patient Name</th>
                        <th className="py-2.5">Scan Target</th>
                        <th className="py-2.5">Integrity Hash</th>
                        <th className="py-2.5 text-right">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650">
                      {referrals.map((r) => (
                        <tr key={r.code} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 font-mono font-bold text-indigo-700">{r.code}</td>
                          <td className="py-3 font-semibold text-slate-900">
                            {r.doctorName} <span className="block text-[9px] font-mono text-slate-400">{r.mctNumber}</span>
                          </td>
                          <td className="py-3 font-medium text-slate-700">{r.patientName}</td>
                          <td className="py-3 font-semibold text-slate-800">
                            {r.scanType} - <span className="text-slate-500 font-normal">{r.targetRegion}</span>
                          </td>
                          <td className="py-3 font-mono text-slate-400">{r.hashToken}</td>
                          <td className="py-3 text-right text-slate-500 font-mono">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Biometric Audits & Bookings Registry</h3>
              {bookings.length === 0 ? (
                <p className="text-slate-400 text-xs text-center p-4">No diagnostic bookings recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-450">
                        <th className="py-2.5">Booking ID</th>
                        <th className="py-2.5">Patient Reference</th>
                        <th className="py-2.5">Target Center</th>
                        <th className="py-2.5">Type & Region</th>
                        <th className="py-2.5">Payment Status</th>
                        <th className="py-2.5">Liveness Details</th>
                        <th className="py-2.5 text-right">Fee Charge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 font-mono font-extrabold text-slate-800">{b.id}</td>
                          <td className="py-3">
                            <span className="font-bold text-slate-900">{b.patientName}</span>
                            <span className="block text-[9px] text-slate-450 font-mono">{b.patientPhone}</span>
                          </td>
                          <td className="py-3 font-medium">{b.hospitalName}</td>
                          <td className="py-3 font-semibold text-slate-800">
                            {b.scanType} <span className="text-[10px] text-slate-450 block font-normal">({b.targetRegion})</span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold font-mono tracking-wider uppercase ${
                                b.paymentStatus === "Paid"
                                  ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200"
                                  : "bg-red-50 text-red-800 ring-1 ring-inset ring-red-200"
                              }`}
                            >
                                {b.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3">
                            {b.paymentLivenessLog ? (
                              <div className="text-[10px] font-mono leading-tight text-slate-700">
                                <span className="text-emerald-600 font-bold">Passed</span> (Score: {(b.paymentLivenessLog.livenessScore * 100).toFixed(0)}%)
                                <span className="block text-slate-400 text-[8px]">Challenge: {b.paymentLivenessLog.challengePerformed}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">None (Outstanding)</span>
                            )}
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-slate-800">
                            {formatTzs(b.finalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
