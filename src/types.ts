export interface Hospital {
  id: string;
  name: string;
  location: string;
  details: string;
  scans: {
    [key: string]: {
      standardTzs: number;
      offPeakTzs: number;
    };
  };
  offPeakHours: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  mctNumber: string;
  status: "Pending" | "Verified";
  inkaPoints: number;
}

export interface Referral {
  code: string;
  doctorId: string;
  doctorName: string;
  mctNumber: string;
  patientName: string;
  patientPhone: string;
  scanType: "MRI" | "CT" | "X-Ray";
  targetRegion: string;
  clinicalNotes: string;
  createdAt: string;
  hashToken: string;
}

export interface Booking {
  id: string;
  referralCode: string | null;
  patientName: string;
  patientPhone: string;
  hospitalId: string;
  hospitalName: string;
  scanType: "MRI" | "CT" | "X-Ray";
  targetRegion: string;
  bookingTime: string;
  isOffPeak: boolean;
  standardPrice: number;
  finalPrice: number;
  paymentStatus: "Pending" | "Paid";
  bookingStatus: "Scheduled" | "Completed";
  clinicalNotesOnly: string;
  hasClinicalNotes?: boolean;
  hasDiagnosisNotes?: boolean;
  paymentLivenessLog?: {
    livenessScore: number;
    attempts: number;
    challengePerformed: string;
    timestamp: string;
  };
  diagnosisNotes?: string;
  diagnosisUploadedAt?: string;
}

export interface PointTransaction {
  id: string;
  doctorId: string;
  points: number;
  type: "EARNED" | "REDEEMED";
  description: string;
  createdAt: string;
  voucherCode?: string;
}
