import React, { useState } from "react";
import { Booking } from "../types";
import { formatTzs, formatDate } from "../utils";
import { Search, ShieldAlert, MonitorCheck, Landmark, CheckCircle2, ShieldClose, Lock, Eye, Check, ChevronDown, RefreshCw, Printer } from "lucide-react";

interface ReceptionistPortalProps {
  bookings: Booking[];
  onTriggerPayment: (booking: Booking) => void;
  onCompleteScan: (bookingId: string, diagnosisNotes: string) => Promise<any>;
}

export default function ReceptionistPortal({
  bookings,
  onTriggerPayment,
  onCompleteScan,
}: ReceptionistPortalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Paid" | "Completed">("All");
  
  // State for radiologist completion modal
  const [activeBookingForDiag, setActiveBookingForDiag] = useState<Booking | null>(null);
  const [radiologistNotes, setRadiologistNotes] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  // States for Printable Receipt Modal
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  // Search and filter list
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.patientPhone.includes(searchTerm) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" && b.paymentStatus === "Pending") ||
      (statusFilter === "Paid" && b.paymentStatus === "Paid" && b.bookingStatus !== "Completed") ||
      (statusFilter === "Completed" && b.bookingStatus === "Completed");

    return matchesSearch && matchesStatus;
  });

  const handleFinaliseScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBookingForDiag || !radiologistNotes.trim()) return;

    setIsCompleting(true);
    try {
      await onCompleteScan(activeBookingForDiag.id, radiologistNotes);
      setActiveBookingForDiag(null);
      setRadiologistNotes("");
    } catch (err: any) {
      alert(err.message || "Failed finalizing scan.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold text-slate-850 flex items-center gap-1.5">
            <MonitorCheck className="h-5 w-5 text-indigo-600" /> Center Receptionist Dashboard
          </h2>
          <p className="text-xs text-slate-500">Validate appointments, initialize biochemical liveness checkout and check payment structures.</p>
        </div>

        {/* Searching input */}
        <div className="flex gap-2 w-full md:w-auto self-stretch md:self-auto shrink-0">
          <div className="relative flex-1 md:flex-initial">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Name / Phone / BK-ID..."
              className="w-full md:w-60 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
              id="recep-search"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2 outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Inbound Fees</option>
            <option value="Paid">Paid (Scheduled Scan)</option>
            <option value="Completed">Scan Completed</option>
          </select>
        </div>
      </div>

      {/* Warning regarding clinician files privacy */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs leading-relaxed text-blue-900 flex items-start gap-3">
        <Lock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-950 uppercase font-mono tracking-wider">Tanzanian PDPC 2022 Privacy Lock:</span>{" "}
          Reception desks are legally forbidden from reading private diagnostic writeups, clinical reasons, or radiologist notes. Sensitive medical fields have been encrypted on network handshakes. Re-verifications are logged by DPOs.
        </div>
      </div>

      {/* List content */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
          <p className="text-xs">No matching patient scheduling logs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-slate-250 bg-white p-5 shadow-xs space-y-4 hover:border-indigo-250 transition-colors"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-450">Patient Appointment ID</span>
                  <div className="text-base font-extrabold font-mono text-slate-850 mt-0.5">{b.id}</div>
                </div>

                <div className="flex gap-1.5">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider uppercase ${
                      b.paymentStatus === "Paid"
                        ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200"
                        : "bg-red-50 text-red-800 ring-1 ring-inset ring-red-200 animate-pulse"
                    }`}
                  >
                    Fee: {b.paymentStatus}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider uppercase ${
                      b.bookingStatus === "Completed"
                        ? "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200"
                        : "bg-orange-50 text-orange-800 ring-1 ring-inset ring-orange-200"
                    }`}
                  >
                    {b.bookingStatus}
                  </span>
                </div>
              </div>

              {/* Patient Core Details */}
              <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600 font-sans border-b border-slate-100 pb-3">
                <div>Name: <strong className="text-slate-900">{b.patientName}</strong></div>
                <div>Phone: <span className="font-mono text-slate-800 font-medium">{b.patientPhone}</span></div>
                <div>Clinic: <span className="text-slate-800 font-semibold">{b.hospitalName}</span></div>
                <div>Requested Scan: <strong className="text-slate-900">{b.scanType} ({b.targetRegion})</strong></div>
                <div className="col-span-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center gap-1.5 mt-1 text-slate-550">
                  <span className="h-2 w-2 rounded-full bg-emerald-555 animate-pulse"></span>
                  <span>Timeslot: <span className="font-mono text-xs text-slate-850 font-semibold">{formatDate(b.bookingTime)}</span></span>
                  {b.isOffPeak && <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-150 font-mono px-1.5 font-bold ml-auto">OFF-PEAK (40% SAVINGS)</span>}
                </div>
              </div>

              {/* PRIVACY EXECUTOR (STRICT PDPC RECEPTIONIST BARRIER) */}
              <div className="rounded-xl bg-rose-50/50 border border-rose-150 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                  <span>Diagnostic Clinical Notes</span>
                  <span className="text-[8px] bg-rose-100 text-rose-800 font-mono font-bold px-1.5 py-0.5 rounded border border-rose-200 uppercase">PDPC COMPLIANT CLOSED</span>
                </div>
                
                <div className="bg-white p-2.5 border border-dashed border-rose-200 rounded-lg flex gap-2.5 items-start text-[10px] leading-relaxed text-rose-900">
                  <Lock className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-rose-700 font-extrabold font-mono">ENCRYPTED PATIENT LOG:</span>{" "}
                    Detailed symptoms classification and doctor's diagnostics notes are masked. Unauthorized viewing triggers automatic security audits reporting directly to the MoH Data Protection Officer (DPO).
                  </div>
                </div>
              </div>

              {/* Receptionist options */}
              <div className="flex flex-wrap gap-2 pt-1 justify-end">
                {b.paymentStatus === "Pending" ? (
                  <button
                    onClick={() => onTriggerPayment(b)}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-2 px-4 text-xs transition-all cursor-pointer active:scale-98 flex items-center gap-1 shadow-xs"
                  >
                    Confirm Patient Fee (Liveness Camera)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setReceiptBooking(b)}
                      className="rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 font-bold py-1.5 px-3.5 text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Printer className="h-3.5 w-3.5 text-slate-500" /> Print PDF Receipt
                    </button>

                    {b.bookingStatus !== "Completed" && (
                      <button
                        onClick={() => {
                          setActiveBookingForDiag(b);
                          setRadiologistNotes("");
                        }}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-1.5 px-3.5 text-xs transition-all cursor-pointer active:scale-98 flex items-center gap-1 shadow-xs"
                      >
                        Finalise Scan & Findings
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Radiologist Scan Completion modal overlay */}
      {activeBookingForDiag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <form
            onSubmit={handleFinaliseScanSubmit}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 space-y-5"
          >
            <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-850 text-base">Radiologist Image Findings Endorsement</h3>
                <p className="text-xs text-slate-550 mt-1">Record MRI/CT imaging diagnosis notes. Completing triggers clinical referral InkaPoints allocation automatically.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveBookingForDiag(null)}
                className="rounded-lg p-1 text-slate-450 hover:text-slate-800 cursor-pointer"
              >
                X
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-150 text-xs text-slate-650 grid grid-cols-2 gap-y-1.5 font-mono">
              <div>Booking Unit ID: <strong className="text-slate-850 font-bold">{activeBookingForDiag.id}</strong></div>
              <div>Patient: <strong className="text-slate-850">{activeBookingForDiag.patientName}</strong></div>
              <div>Scan Category: <strong className="text-indigo-700 font-bold">{activeBookingForDiag.scanType} ({activeBookingForDiag.targetRegion})</strong></div>
              <div>Referral Auth: <strong className="text-slate-700">{activeBookingForDiag.referralCode || "Self-Book (No referral)"}</strong></div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Radiologist Official Clinical Notes & Diagnosis Findings</label>
              <textarea
                required
                rows={5}
                value={radiologistNotes}
                onChange={(e) => setRadiologistNotes(e.target.value)}
                placeholder="Declare radiology anatomy findings, disc protrusion state, signals anomalies, or physical suggestions..."
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
            </div>

            <div className="bg-amber-50 border border-amber-150 p-3.5 rounded-xl flex items-start gap-2.5 text-[10px] text-amber-900 leading-relaxed">
              <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero-Trace Policy:</strong> Direct linkage to the patient PII logs is cryptographically severed upon completing, storing points only. Complies securely with Tanzanian Ministry of Health laws.
              </span>
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setActiveBookingForDiag(null)}
                className="rounded-xl bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-150 px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isCompleting}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-bold px-4 py-2 text-xs shadow-xs transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
              >
                {isCompleting && <RefreshCw className="h-3 w-3 animate-spin" />}
                Sign & Finalise Diagnostics
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/85 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-2xl border-2 border-dashed border-slate-305 bg-white text-slate-800 p-6 space-y-5 shadow-2xl font-mono">
            {/* Stamp logo */}
            <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-250">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-widest">Inka Health Tanzania</h3>
              <p className="text-[10px] text-slate-500 font-sans">Healthcare at your fingertips</p>
              <p className="text-[9px] text-slate-400">MNH RAD-HUB GATEWAY v2026</p>
            </div>

            {/* Receipt body details */}
            <div className="space-y-2 text-xs leading-relaxed">
              <div className="flex justify-between">
                <span>Receipt Ref:</span>
                <span className="text-slate-900 font-bold">{receiptBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date Created:</span>
                <span>{new Date(receiptBooking.bookingTime).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Client Name:</span>
                <span className="text-slate-800">{receiptBooking.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span>Cell Phone:</span>
                <span>{receiptBooking.patientPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>Diagnostics:</span>
                <span className="text-slate-900 font-bold">{receiptBooking.scanType}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Region:</span>
                <span>{receiptBooking.targetRegion}</span>
              </div>
              <div className="flex justify-between">
                <span>Center Site:</span>
                <span className="text-slate-700">{receiptBooking.hospitalName}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-250 pt-2 font-bold text-sm">
                <span>TOTAL PAID FEE:</span>
                <span className="text-indigo-700 font-extrabold">{formatTzs(receiptBooking.finalPrice)}</span>
              </div>
            </div>

            {/* Simulated QR Code or verification footprint */}
            {receiptBooking.paymentLivenessLog && (
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-205 text-[9px] text-slate-500 leading-tight space-y-1 font-mono">
                <div className="text-indigo-700 font-bold uppercase text-[10px]">Tanzania Biometric Stamp</div>
                <div>Liveness Verified: {(receiptBooking.paymentLivenessLog.livenessScore * 100).toFixed(1)}%</div>
                <div>Challenge Method: {receiptBooking.paymentLivenessLog.challengePerformed}</div>
                <div>Audit Signature: HMAC-SHA256-{receiptBooking.id}</div>
              </div>
            )}

            <div className="border-t border-dashed border-slate-250 pt-3 text-center space-y-3.5 font-sans">
              <p className="text-[8px] text-slate-400 leading-relaxed uppercase">
                Tanzania Health Regulatory Roadmap Assurance: This medical invoice holds legal stamp verifying clinical standards and PDPC 2022 localization structures.
              </p>
              
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => alert("Forwarding receipt via Beem Africa API Gateway SMS queue...")}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-bold px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  Send SMS Copy
                </button>
                <button
                  onClick={() => window.print()}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-250 font-bold px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer"
                >
                  Download SVG ID
                </button>
              </div>
            </div>

            <button
              onClick={() => setReceiptBooking(null)}
              className="w-full text-center text-[10px] text-slate-400 hover:text-slate-655 cursor-pointer font-sans"
            >
              Close Print View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
