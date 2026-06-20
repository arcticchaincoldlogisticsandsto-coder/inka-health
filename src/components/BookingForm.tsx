import React, { useState, useEffect } from "react";
import { Hospital, Booking } from "../types";
import { formatTzs } from "../utils";
import { Clock, KeyRound, Check, FileSignature, CheckCircle2, ShieldClose, CalendarDays } from "lucide-react";

interface BookingFormProps {
  hospitals: Hospital[];
  selectedHospitalId: string | null;
  selectedScanType: "MRI" | "CT" | "X-Ray";
  onBookingSuccess: (booking: Booking) => void;
  onCancel: () => void;
}

export default function BookingForm({
  hospitals,
  selectedHospitalId,
  selectedScanType,
  onBookingSuccess,
  onCancel,
}: BookingFormProps) {
  const [hospId, setHospId] = useState(selectedHospitalId || "");
  const [sType, setSType] = useState<"MRI" | "CT" | "X-Ray">(selectedScanType);
  const [referralCode, setReferralCode] = useState("");
  const [isRefValidating, setIsRefValidating] = useState(false);
  const [refMsg, setRefMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [patName, setPatName] = useState("");
  const [patPhone, setPatPhone] = useState("");
  const [targetRegion, setTargetRegion] = useState("");
  const [bookingDate, setBookingDate] = useState("2026-06-21");
  const [bookingTime, setBookingTime] = useState("21:30"); // Default to off-peak to recommend savings!
  const [notes, setNotes] = useState("");

  const [isOffPeak, setIsOffPeak] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const selectedHospital = hospitals.find((h) => h.id === hospId) || null;

  // Track off-peak estimation
  useEffect(() => {
    if (!selectedHospital) return;
    const rateSchema = selectedHospital.scans[sType];
    if (!rateSchema) return;

    // Is selection off-peak?
    let offPeak = false;
    try {
      const h = parseInt(bookingTime.split(":")[0]);
      if (hospId === "hosp-mnh" || hospId === "hosp-hindumandal") {
        offPeak = (h >= 20 || h < 5);
      } else if (hospId === "hosp-agakhan") {
        offPeak = (h >= 20 || h < 5);
      } else if (hospId === "hosp-regency") {
        offPeak = (h >= 21 || h < 6);
      } else if (hospId === "hosp-kairuki") {
        offPeak = (h >= 18 && h < 22);
      }
    } catch (e) {
      offPeak = false;
    }

    setIsOffPeak(offPeak);
    setEstimatedPrice(offPeak ? rateSchema.offPeakTzs : rateSchema.standardTzs);
  }, [hospId, sType, bookingTime, selectedHospital]);

  // Validate Referral Code and Prefill
  const handleValidateReferral = async () => {
    if (!referralCode.trim()) {
      setRefMsg({ type: "error", text: "Please input a referral code first." });
      return;
    }

    setIsRefValidating(true);
    setRefMsg(null);

    try {
      const response = await fetch(`/api/referrals/validate/${referralCode.trim()}`);
      const data = await response.json();

      if (data.found && data.referral) {
        const ref = data.referral;
        setRefMsg({ type: "success", text: `Active referral verified! Signed by ${ref.doctorName} (MCT: ${ref.mctNumber}). Prefilling parameters.` });
        
        // Prefill
        setPatName(ref.patientName);
        setPatPhone(ref.patientPhone);
        setSType(ref.scanType);
        setTargetRegion(ref.targetRegion);
        setNotes(ref.clinicalNotes);
      } else {
        setRefMsg({ type: "error", text: "Referral code not found or expired. Check capitalization." });
      }
    } catch (err) {
      setRefMsg({ type: "error", text: "Failed communicating with referral networks." });
    } finally {
      setIsRefValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospId || !patName || !patPhone || !targetRegion || !bookingDate || !bookingTime) {
      alert("Please enter all patient, anatomy, and scheduling factors.");
      return;
    }

    const isoBookingTime = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();

    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralCode: referralCode.trim() || null,
          patientName: patName,
          patientPhone: patPhone,
          hospitalId: hospId,
          scanType: sType,
          targetRegion,
          bookingTime: isoBookingTime,
          clinicalNotesOnly: notes,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed registering slot");
      }

      const data = await response.json();
      onBookingSuccess(data.booking);
    } catch (err: any) {
      alert(err.message || "Error completing patient booking registry.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md max-w-2xl mx-auto space-y-6 animate-fade-in font-sans">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-emerald-400" /> Book Diagnostics Appointment
        </h2>
        <p className="text-xs text-slate-400 mt-1">Schedule a scanning slot at Tanzanian centers. Match off-peak constraints to enjoy reduced fees.</p>
      </div>

      {/* Cryptographic Referrals Prefiller */}
      <div className="rounded-xl bg-slate-950 border border-slate-850 p-4 space-y-3">
        <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5 text-emerald-400" /> Have Clinician referral ID? (Optional)
        </label>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="e.g. REF-MRI-XXXXX"
            className="flex-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs px-3 py-1.5 font-mono uppercase"
          />
          <button
            type="button"
            onClick={handleValidateReferral}
            disabled={isRefValidating}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-1.5 font-bold transition-all disabled:opacity-50"
          >
            {isRefValidating ? "Vetting..." : "Vette & Prefill"}
          </button>
        </div>

        {refMsg && (
          <div className={`text-[10px] p-2.5 rounded ${refMsg.type === "success" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-900/40" : "bg-red-950/40 text-red-300 border border-red-900/40"}`}>
            {refMsg.text}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core Locations and Scans selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Clinic Site</label>
            <select
              value={hospId}
              required
              onChange={(e) => setHospId(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 outline-none"
            >
              <option value="">-- Choose Diagnostic Hub --</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Scan Type</label>
            <select
              value={sType}
              required
              onChange={(e) => setSType(e.target.value as any)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-100 outline-none"
            >
              <option value="MRI">MRI Scan</option>
              <option value="CT">CT Scan</option>
              <option value="X-Ray">X-Ray Core</option>
            </select>
          </div>
        </div>

        {/* Patient Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Patient Full Name</label>
            <input
              type="text"
              required
              value={patName}
              onChange={(e) => setPatName(e.target.value)}
              placeholder="Full Name as per NIDA Card"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Patient Mobile Line</label>
            <input
              type="text"
              required
              value={patPhone}
              onChange={(e) => setPatPhone(e.target.value)}
              placeholder="+255 7XX XXX XXX"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Target Body Area */}
        <div>
          <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Anatomy Target / Region</label>
          <input
            type="text"
            required
            value={targetRegion}
            onChange={(e) => setTargetRegion(e.target.value)}
            placeholder="e.g. Thorax, Lumbar Column L1-L5, Knee Joint"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>

        {/* Timeslot scheduling & date picker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Schedule Date</label>
            <input
              type="date"
              required
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1 flex justify-between">
              <span>Schedule Time Hour</span>
              {selectedHospital && <span className="text-emerald-400 font-bold">Window: {selectedHospital.offPeakHours}</span>}
            </label>
            <input
              type="time"
              required
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white outline-none font-mono"
            />
          </div>
        </div>

        {/* Private symptoms remarks */}
        <div>
          <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Brief Symptoms Remarks (Encrypted)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. localized backache radiating downwards..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>

        {/* Interactive Pricing Estimator & Discount Feedback */}
        {selectedHospital && (
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-850 flex items-center justify-between text-xs leading-5">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Rate Class Advisory</span>
              {isOffPeak ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-sans">
                  <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>OFF-PEAK NIGHT SAVINGS APPLIED! (-40%)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>Standard Shift Rate active.</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Estimated Cost</span>
              <span className={`text-base font-extrabold font-mono ${isOffPeak ? 'text-emerald-400' : 'text-slate-100'}`}>
                {formatTzs(estimatedPrice)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-800 text-slate-400 hover:text-white px-5 py-2 text-xs font-semibold"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 text-xs shadow-md transition-transform active:scale-95"
          >
            Finalise & Confirm Appointment Slot
          </button>
        </div>
      </form>
    </div>
  );
}
