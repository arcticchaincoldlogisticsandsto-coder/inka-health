import React, { useState } from "react";
import { Doctor, Referral, PointTransaction } from "../types";
import { formatTzs, formatDate } from "../utils";
import { FileSignature, ShieldAlert, Award, FileSpreadsheet, RefreshCw, Send, CheckCircle, Ticket, Printer, Plus, Users } from "lucide-react";

interface DoctorPortalProps {
  doctors: Doctor[];
  referrals: Referral[];
  activeDoctorId: string | null;
  onSelectDoctor: (doctorId: string | null) => void;
  onRegisterDoctor: (doctorForm: { name: string; email: string; mctNumber: string }) => Promise<any>;
  onCreateReferral: (referralForm: {
    patientName: string;
    patientPhone: string;
    scanType: "MRI" | "CT" | "X-Ray";
    targetRegion: string;
    clinicalNotes: string;
  }) => Promise<any>;
  onRedeemPoints: (redeemForm: {
    rewardType: string;
    pointsRequired: number;
    valueTzs: number;
  }) => Promise<any>;
}

export default function DoctorPortal({
  doctors,
  referrals,
  activeDoctorId,
  onSelectDoctor,
  onRegisterDoctor,
  onCreateReferral,
  onRedeemPoints,
}: DoctorPortalProps) {
  // Local states
  const [showRegForm, setShowRegForm] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMct, setRegMct] = useState("");
  const [regMsg, setRegMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [patName, setPatName] = useState("");
  const [patPhone, setPatPhone] = useState("");
  const [scanType, setScanType] = useState<"MRI" | "CT" | "X-Ray">("MRI");
  const [targetRegion, setTargetRegion] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [referralSuccessMsg, setReferralSuccessMsg] = useState<string | null>(null);
  const [generatedReferral, setGeneratedReferral] = useState<Referral | null>(null);

  // Redemption States
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<{ code: string; type: string; valueTzs: number } | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const currentDoctor = doctors.find((d) => d.id === activeDoctorId) || null;
  const filteredReferrals = referrals.filter((r) => r.doctorId === activeDoctorId);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegMsg(null);
    if (!regName || !regEmail || !regMct) {
      setRegMsg({ type: "error", text: "Please enter all onboarding parameters." });
      return;
    }

    try {
      const res = await onRegisterDoctor({ name: regName, email: regEmail, mctNumber: regMct });
      setRegMsg({ type: "success", text: res.message });
      // Reset inputs
      setRegName("");
      setRegEmail("");
      setRegMct("");
    } catch (err: any) {
      setRegMsg({ type: "error", text: err.message || "Failed doctor onboarding." });
    }
  };

  const handleCreateReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReferralSuccessMsg(null);
    setGeneratedReferral(null);

    if (!patName || !patPhone || !targetRegion) {
      alert("Please complete all patient and anatomy fields.");
      return;
    }

    try {
      const res = await onCreateReferral({
        patientName: patName,
        patientPhone: patPhone,
        scanType,
        targetRegion,
        clinicalNotes,
      });

      setReferralSuccessMsg(res.message);
      setGeneratedReferral(res.referral);

      // Reset
      setPatName("");
      setPatPhone("");
      setTargetRegion("");
      setClinicalNotes("");
    } catch (err: any) {
      alert(err.message || "Error building referral");
    }
  };

  const executePointRedemption = async (type: string, points: number, value: number) => {
    setRedeemError(null);
    setActiveVoucher(null);

    if (!currentDoctor || currentDoctor.inkaPoints < points) {
      setRedeemError("Insufficient InkaPoints in doctor account.");
      return;
    }

    try {
      const result = await onRedeemPoints({
        rewardType: type,
        pointsRequired: points,
        valueTzs: value,
      });

      setActiveVoucher({
        code: result.voucherCode,
        type,
        valueTzs: value,
      });
    } catch (err: any) {
      setRedeemError(err.message || "Redemption request failed.");
    }
  };

  const triggerMockSmsFallback = () => {
    if (activeVoucher) {
      alert(`Fallback SMS Sent to ${currentDoctor?.email || "Doctor"}: \n"Dr. Vocha: ${activeVoucher.code}. Value: ${formatTzs(activeVoucher.valueTzs)} successfully logged with Beem SMS Gateway."`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-slate-800">
      {/* Clinician Authentication selector */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm">Practitioner Portal Key</h3>
          <p className="text-xs text-slate-550 mt-1">Select your clinician account below or sign on as a new doctor.</p>

          <div className="mt-4 space-y-3">
            <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Select Active Clinician</label>
            <select
              value={activeDoctorId || ""}
              onChange={(e) => onSelectDoctor(e.target.value || null)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium"
            >
              <option value="">-- No Physician Selected --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.mctNumber}) [{d.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowRegForm(!showRegForm)}
              className="w-full rounded-xl bg-slate-50 hover:bg-slate-100 px-3 py-2.5 text-xs text-slate-650 font-bold border border-slate-250 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 text-indigo-600" />
              {showRegForm ? "Hide Onboarding Panel" : "Register New Medical Doctor"}
            </button>
          </div>

          {/* New Registration Panel */}
          {showRegForm && (
            <form onSubmit={handleRegister} className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-3 shadow-inner">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">MD Registration Gate</h4>
              
              <div>
                <label className="block text-[9px] uppercase font-mono text-slate-400">FullName (Dr.)</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Dr. Amina Omary"
                  className="w-full rounded bg-white border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-mono text-slate-400">Official Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="amina.omary@mnh.or.tz"
                  className="w-full rounded bg-white border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-mono text-slate-400 flex justify-between">
                  <span>MCT Reg Number</span>
                  <span className="text-indigo-600 font-bold">Regex Audit</span>
                </label>
                <input
                  type="text"
                  required
                  value={regMct}
                  onChange={(e) => setRegMct(e.target.value)}
                  placeholder="e.g. MCT14828"
                  className="w-full rounded bg-white border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800 focus:border-indigo-500 outline-none"
                />
                <span className="text-[8px] text-slate-450 leading-tight block mt-1 font-mono">Format: MCT followed by 5 to 7 digits.</span>
              </div>

              {regMsg && (
                <div className={`p-2.5 rounded text-[10px] leading-tight ${regMsg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-250" : "bg-red-50 text-red-800 border border-red-255"}`}>
                  {regMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-2 text-xs transition-all cursor-pointer"
              >
                Submit Clinical Board Logs
              </button>
            </form>
          )}
        </div>

        {/* InkaPoints Ledger View */}
        {currentDoctor && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                <Award className="h-3.5 w-3.5 text-amber-705" /> Clinical Partnership Points
              </span>
              <span className="text-[10px] text-amber-700 font-mono">PDPC Compliant</span>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono text-amber-700 font-bold tracking-wider">InkaPoints Balance:</div>
              <div className="text-3xl font-black font-mono text-amber-800 mt-1">{currentDoctor.inkaPoints} <span className="text-sm font-semibold text-slate-500">pts</span></div>
            </div>

            <p className="text-xs text-amber-900/80 leading-relaxed font-sans mt-1">
              You earn <strong>200 points</strong> for every patient referral scan successfully processed and completed. Redeem points for CME training, medical journals, or equipment grants.
            </p>

            <button
              onClick={() => {
                setShowRedeemModal(true);
                setActiveVoucher(null);
                setRedeemError(null);
              }}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-amber-500/10"
            >
              <Ticket className="h-4 w-4" /> Redeem InkaPoints
            </button>
          </div>
        )}
      </div>

      {/* Main Referral management area */}
      <div className="lg:col-span-2 space-y-6">
        {!currentDoctor ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-3 flex flex-col items-center shadow-xs">
            <FileSignature className="h-10 w-10 text-slate-400 animate-pulse" />
            <h4 className="font-bold text-slate-800 text-sm">Doctor Account Not Selected</h4>
            <p className="text-xs max-w-sm leading-relaxed text-slate-500">Please select a registered clinical practitioner from the left sidebar dropdown to begin generating secure referrals, tracking clinical points, or ordering diagnostic routines.</p>
          </div>
        ) : (
          <>
            {/* Registered & Verified Status Banner */}
            {currentDoctor.status !== "Verified" ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 text-xs leading-relaxed text-amber-800">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-amber-905">Account Pending Verification</h4>
                  <p className="mt-0.5">Your Medical Council of Tanzania (MCT) credentials format does not match general registers. Your referrals cannot be issued cryptographically until an administrator approves your license file.</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-xs leading-relaxed text-emerald-800">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900 uppercase font-mono tracking-wider">MCT VERIFIED PRACTITIONER</h4>
                  <p className="mt-0.5 text-[11px] text-emerald-800">Logged in as: <strong className="text-slate-900">{currentDoctor.name}</strong> ({currentDoctor.mctNumber}). Highly authorized to draft high-trust diagnostic referral codes.</p>
                </div>
              </div>
            )}

            {/* Referral Form Generation */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-850 text-base">Generate High-Trust Imaging Referral</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Structure your clinical recommendation below. Under Tanzanian legal norms (TMDA Cap 219), imaging scans must only occur after medical assessment. Your digital signature token guarantees system compliance.
                </p>
              </div>

              <form onSubmit={handleCreateReferralSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      value={patName}
                      onChange={(e) => setPatName(e.target.value)}
                      placeholder="e.g. Fatma Kassim"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Patient Phone Line</label>
                    <input
                      type="text"
                      required
                      value={patPhone}
                      onChange={(e) => setPatPhone(e.target.value)}
                      placeholder="+255 764 ..."
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Diagnostic Scan Requested</label>
                    <select
                      value={scanType}
                      onChange={(e) => setScanType(e.target.value as any)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="MRI">MRI Scan (Magnetosphere Imaging)</option>
                      <option value="CT">CT Scan (Computed Tomography)</option>
                      <option value="X-Ray">X-Ray (Standard Radiograph)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Target Body Anatomy/Region</label>
                    <input
                      type="text"
                      required
                      value={targetRegion}
                      onChange={(e) => setTargetRegion(e.target.value)}
                      placeholder="e.g. Lumbar Spine, Skull, Pelvic Cavity"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-500 font-bold mb-1">Private Diagnostic Symptom Findings & Clinical Notes</label>
                  <textarea
                    required
                    rows={3}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Provide patient clinical diagnosis indicators to frame the scanning technicians..."
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={currentDoctor.status !== "Verified"}
                  className={`w-full rounded-xl py-3 text-xs text-center font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                    currentDoctor.status === "Verified"
                      ? "bg-indigo-600 hover:bg-indigo-550 text-white shadow-xs cursor-pointer active:scale-98"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  }`}
                >
                  <Send className="h-4 w-4" /> Cryptographically Authorized and Dispatch Referral
                </button>
              </form>

              {/* Generated Referral display outcome */}
              {referralSuccessMsg && generatedReferral && (
                <div className="rounded-xl bg-emerald-50/70 border border-emerald-250 p-5 mt-4 space-y-4 animate-fade-in shadow-xs text-slate-800">
                  <div className="flex justify-between items-start border-b border-emerald-200/50 pb-2.5">
                    <div>
                      <span className="text-[9px] uppercase font-mono font-bold text-emerald-800 tracking-wider">Generated Medical Referral</span>
                      <h4 className="text-base font-extrabold font-mono text-emerald-900">{generatedReferral.code}</h4>
                    </div>
                    <div className="rounded bg-emerald-100/60 border border-emerald-200 px-2 py-0.5 text-[8px] font-mono text-emerald-800 uppercase font-semibold">
                      Token: {generatedReferral.hashToken}
                    </div>
                  </div>

                  <p className="text-xs text-emerald-950/90 leading-relaxed italic border-l-2 border-emerald-300 pl-3">
                    "{generatedReferral.clinicalNotes}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-[11px] leading-tight text-emerald-800">
                    <div>Patient: <strong className="text-emerald-950">{generatedReferral.patientName}</strong></div>
                    <div>Phone: <span className="font-mono text-emerald-950">{generatedReferral.patientPhone}</span></div>
                    <div>Type: <strong className="text-emerald-950">{generatedReferral.scanType} ({generatedReferral.targetRegion})</strong></div>
                    <div>MD: <span className="text-emerald-950">{generatedReferral.doctorName} (MCT: {generatedReferral.mctNumber})</span></div>
                  </div>

                  <p className="text-[10px] text-emerald-705 pt-2 border-t border-emerald-200/50 leading-relaxed font-mono font-bold">
                    ⚠️ Clinical Referral Issued: Copy this Referral Code to apply for off-peak diagnostics scheduling.
                  </p>
                </div>
              )}
            </div>

            {/* Issued referrals log */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-850 text-sm">Referrals Ledger</h3>

              {filteredReferrals.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">You have not issued any digital referrals yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {filteredReferrals.map((r) => (
                    <div key={r.code} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-800">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700 text-sm">{r.code}</span>
                          <span className="text-[9px] uppercase font-mono text-slate-500 px-1.5 py-0.5 bg-slate-200/50 border border-slate-300 rounded">[{r.scanType}]</span>
                        </div>
                        <div className="text-slate-650 mt-1">
                          For Patient: <strong className="text-slate-800">{r.patientName}</strong> ({r.targetRegion})
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Created on: {formatDate(r.createdAt)}</div>
                      </div>

                      <div className="text-right self-start md:self-auto shrink-0">
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold py-1 px-2.5 rounded-lg border border-indigo-150">
                          Secure Node Signed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Reward Points Redemption Modal */}
      {showRedeemModal && currentDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-850 text-base">InkaPoints Reward Lounge</h3>
                <p className="text-xs text-slate-500 mt-1">Select CME, Books or Grants. Zero patient trace ledger.</p>
              </div>
              <button
                onClick={() => setShowRedeemModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
              >
                X
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex justify-between items-center text-xs">
              <span className="text-amber-900 font-semibold">Your Active Balance:</span>
              <span className="font-extrabold font-mono text-amber-805 text-lg">{currentDoctor.inkaPoints} pts</span>
            </div>

            {/* List rewards catalog */}
            <div className="space-y-3">
              {/* Reward Item */}
              <div className="rounded-xl border border-slate-200 p-3 flex justify-between items-center text-xs bg-slate-50 hover:border-slate-350 transition-all">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">Clinical Equipment Grant</span>
                  <p className="text-[10px] text-slate-500">Value: 50,000 TZS vouchers</p>
                </div>
                <button
                  onClick={() => executePointRedemption("Equip", 500, 50000)}
                  disabled={currentDoctor.inkaPoints < 500}
                  className="rounded bg-amber-500 text-slate-950 font-bold px-3 py-1.5 text-[11px] hover:bg-amber-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                >
                  Redeem (500 pts)
                </button>
              </div>

              {/* Reward Item */}
              <div className="rounded-xl border border-slate-200 p-3 flex justify-between items-center text-xs bg-slate-50 hover:border-slate-350 transition-all">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">Medical Journal Open Pass</span>
                  <p className="text-[10px] text-slate-500">Value: 100,000 TZS subscriptions</p>
                </div>
                <button
                  onClick={() => executePointRedemption("Journal", 1000, 100000)}
                  disabled={currentDoctor.inkaPoints < 1000}
                  className="rounded bg-amber-500 text-slate-950 font-bold px-3 py-1.5 text-[11px] hover:bg-amber-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                >
                  Redeem (1000 pts)
                </button>
              </div>

              {/* Reward Item */}
              <div className="rounded-xl border border-slate-200 p-3 flex justify-between items-center text-xs bg-slate-50 hover:border-slate-350 transition-all">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">CME Training Seminar Grant</span>
                  <p className="text-[10px] text-slate-500">Value: 150,000 TZS entry tokens</p>
                </div>
                <button
                  onClick={() => executePointRedemption("CME", 1500, 150000)}
                  disabled={currentDoctor.inkaPoints < 1500}
                  className="rounded bg-amber-500 text-slate-950 font-bold px-3 py-1.5 text-[11px] hover:bg-amber-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                >
                  Redeem (1500 pts)
                </button>
              </div>
            </div>

            {redeemError && (
              <div className="text-red-500 text-xs text-center border-t border-slate-100 pt-3">
                {redeemError}
              </div>
            )}

            {/* If voucher redeemed successfully: display details */}
            {activeVoucher && (
              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 text-center space-y-3.5 animate-fade-in shadow-xs text-slate-800">
                <div className="flex flex-col items-center">
                  <Ticket className="h-10 w-10 text-amber-500 animate-bounce" />
                  <span className="text-[10px] uppercase font-mono tracking-widest text-amber-800 mt-2 font-bold">VOUCHER ACTIVE</span>
                  <div className="text-base font-extrabold font-mono text-amber-900 uppercase tracking-widest mt-1 select-all">
                    {activeVoucher.code}
                  </div>
                  <p className="text-xs text-amber-900/90 mt-1 font-sans">
                    Voucher active for <strong className="text-slate-950">{formatTzs(activeVoucher.valueTzs)}</strong> credit redeemable on local gateways.
                  </p>
                </div>

                <div className="flex justify-center gap-2 pt-2 border-t border-amber-200/50">
                  <button
                    onClick={triggerMockSmsFallback}
                    className="rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 text-[11px] flex items-center gap-1.5 transition-all cursor-pointer font-medium"
                  >
                    SMS Confirmation
                  </button>
                  <button
                    onClick={() => {
                      alert(`Printing Clinic Voucher: \n========================== \nINCA HEALTH SYSTEM \nLicense Code: ${activeVoucher.code} \nPhysician Ref: ${currentDoctor.name} \nValue: ${activeVoucher.valueTzs} TZS \n==========================`);
                    }}
                    className="rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 text-[11px] flex items-center gap-1.5 transition-all cursor-pointer font-medium"
                  >
                    <Printer className="h-3 w-3" /> Print PDF
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowRedeemModal(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              Close Rewards Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
