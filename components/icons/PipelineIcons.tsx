import * as React from "react";

/**
 * Brand-aligned pipeline icons (line art, monochrome with bingo green accent).
 * Replaces emoji like 📝 🚫 💸 🚗 with consistent branded icons.
 */

type Props = { className?: string; size?: number };

const base = (size: number) => ({
  viewBox: "0 0 24 24",
  width: size,
  height: size,
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function PipeUnderwriting({ size = 16, className }: Props) {
  // Document with check - underwriting/screening dept
  return (
    <svg {...base(size)} className={className}>
      <path d="M14 3v4a1 1 0 001 1h4" />
      <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
      <polyline points="9 14 11 16 15 12" stroke="#2EA10D" strokeWidth="2" />
    </svg>
  );
}

export function PipeIrrelevant({ size = 16, className }: Props) {
  // Slashed circle - not relevant/blocked
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function PipeGeneralLoan({ size = 16, className }: Props) {
  // Money/cash - general loan
  return (
    <svg {...base(size)} className={className}>
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <circle cx="12" cy="12.5" r="3.2" stroke="#2EA10D" strokeWidth="2" />
      <circle cx="5.5" cy="12.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PipeVehicle({ size = 16, className }: Props) {
  // Car - vehicle department
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 14l2-6c.3-1 1-2 2-2h10c1 0 1.7 1 2 2l2 6v5h-3v-2H6v2H3v-5z" />
      <circle cx="7" cy="16" r="1.5" fill="#2EA10D" stroke="none" />
      <circle cx="17" cy="16" r="1.5" fill="#2EA10D" stroke="none" />
    </svg>
  );
}

export function PipeRetention({ size = 16, className }: Props) {
  // Handshake-like / loop - retention
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 12c0-3 2-5 5-5s5 2 5 5 2 5 5 5 5-2 5-5" />
      <circle cx="8" cy="7" r="1.2" fill="#2EA10D" stroke="none" />
      <circle cx="18" cy="17" r="1.2" fill="#2EA10D" stroke="none" />
    </svg>
  );
}

export function PipeArchive({ size = 16, className }: Props) {
  // Archive box
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="3" width="18" height="5" rx="1" />
      <path d="M5 8v11a2 2 0 002 2h10a2 2 0 002-2V8" />
      <line x1="10" y1="13" x2="14" y2="13" stroke="#2EA10D" strokeWidth="2" />
    </svg>
  );
}

export function PipeWati({ size = 16, className }: Props) {
  // Chat bubble - WhatsApp/WATI
  return (
    <svg {...base(size)} className={className}>
      <path d="M21 12c0 4-4 7-9 7-1.5 0-3-.3-4-.8L3 20l1-4c-1-1.2-1-2.5-1-4 0-4 4-7 9-7s9 3 9 7z" />
      <circle cx="9" cy="12" r="0.8" fill="#2EA10D" stroke="none" />
      <circle cx="12" cy="12" r="0.8" fill="#2EA10D" stroke="none" />
      <circle cx="15" cy="12" r="0.8" fill="#2EA10D" stroke="none" />
    </svg>
  );
}

export function PipeSpam({ size = 16, className }: Props) {
  // Warning triangle - spam
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3l10 18H2L12 3z" />
      <line x1="12" y1="10" x2="12" y2="14" stroke="#2EA10D" strokeWidth="2" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PipeLegal({ size = 16, className }: Props) {
  // Scales of justice - legal
  return (
    <svg {...base(size)} className={className}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="6" y1="21" x2="18" y2="21" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <path d="M4 6l-2 6h4l-2-6z" stroke="#2EA10D" strokeWidth="1.8" />
      <path d="M20 6l-2 6h4l-2-6z" stroke="#2EA10D" strokeWidth="1.8" />
    </svg>
  );
}

/* ---- Status category icons ---- */

export function StatNew({ size = 14, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="5" fill="#50FF0A" stroke="none" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function StatCall({ size = 14, className }: Props) {
  // Phone outgoing
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 4h4l2 5-3 1.5c1 2 3 4 5 5L14 12l5 2v4a2 2 0 01-2 2C9 20 3 14 3 6a2 2 0 012-2z" />
    </svg>
  );
}

export function StatNoAnswer({ size = 14, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 4h4l2 5-3 1.5c1 2 3 4 5 5L14 12l5 2v4a2 2 0 01-2 2C9 20 3 14 3 6a2 2 0 012-2z" />
      <line x1="3" y1="3" x2="21" y2="21" stroke="#EF4444" strokeWidth="2" />
    </svg>
  );
}

export function StatCallback({ size = 14, className }: Props) {
  // Loop arrow
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 12a9 9 0 1115 6.7" />
      <polyline points="18 12 18 19 11 19" />
    </svg>
  );
}

export function StatWaiting({ size = 14, className }: Props) {
  // Clock
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

export function StatApproved({ size = 14, className }: Props) {
  // Check circle
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="9" fill="#2EA10D" stroke="none" opacity="0.15" />
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12 11 15 16 9" stroke="#2EA10D" strokeWidth="2.2" />
    </svg>
  );
}

export function StatRejected({ size = 14, className }: Props) {
  // X circle
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="9" x2="15" y2="15" stroke="#EF4444" strokeWidth="2" />
      <line x1="15" y1="9" x2="9" y2="15" stroke="#EF4444" strokeWidth="2" />
    </svg>
  );
}

export function StatPaid({ size = 14, className }: Props) {
  // Coin stack
  return (
    <svg {...base(size)} className={className}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      <circle cx="12" cy="6" r="1" fill="#2EA10D" stroke="none" />
    </svg>
  );
}

export function StatDocs({ size = 14, className }: Props) {
  // Documents
  return (
    <svg {...base(size)} className={className}>
      <rect x="5" y="3" width="11" height="15" rx="1" />
      <rect x="8" y="6" width="11" height="15" rx="1" stroke="#2EA10D" />
    </svg>
  );
}

export function StatSign({ size = 14, className }: Props) {
  // Pen / signature
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 21l3-1 11-11-2-2L4 18l-1 3z" />
      <path d="M15 5l4 4" stroke="#2EA10D" strokeWidth="2" />
    </svg>
  );
}

export function StatBlocked({ size = 14, className }: Props) {
  // Slash
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="6" y1="6" x2="18" y2="18" stroke="#EF4444" strokeWidth="2" />
    </svg>
  );
}

export function StatHot({ size = 14, className }: Props) {
  // Flame
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3c2 4 6 5 6 11 0 4-3 7-6 7s-6-3-6-7c0-2 1-3.5 2-4 0 1.5 1 2.5 2 2.5 0-3 0-6 2-9.5z" fill="#FF9D29" stroke="none" />
      <path d="M12 3c2 4 6 5 6 11 0 4-3 7-6 7s-6-3-6-7c0-2 1-3.5 2-4 0 1.5 1 2.5 2 2.5 0-3 0-6 2-9.5z" />
    </svg>
  );
}

export function StatID({ size = 14, className }: Props) {
  // ID card
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" stroke="#2EA10D" />
      <line x1="14" y1="10" x2="18" y2="10" />
      <line x1="14" y1="13" x2="18" y2="13" />
    </svg>
  );
}

export function StatChecking({ size = 14, className }: Props) {
  // Magnifier
  return (
    <svg {...base(size)} className={className}>
      <circle cx="10" cy="10" r="6" />
      <line x1="15" y1="15" x2="21" y2="21" />
    </svg>
  );
}

export function StatChat({ size = 14, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M21 12c0 4-4 7-9 7-1.5 0-3-.3-4-.8L3 20l1-4c-1-1.2-1-2.5-1-4 0-4 4-7 9-7s9 3 9 7z" />
    </svg>
  );
}

/** Lookup by emoji code or status family */
export function StatusGlyph({ kind, size = 14, className }: { kind: StatusKind; size?: number; className?: string }) {
  const map: Record<StatusKind, React.ReactNode> = {
    new: <StatNew size={size} className={className} />,
    call: <StatCall size={size} className={className} />,
    "no-answer": <StatNoAnswer size={size} className={className} />,
    callback: <StatCallback size={size} className={className} />,
    waiting: <StatWaiting size={size} className={className} />,
    approved: <StatApproved size={size} className={className} />,
    rejected: <StatRejected size={size} className={className} />,
    paid: <StatPaid size={size} className={className} />,
    docs: <StatDocs size={size} className={className} />,
    sign: <StatSign size={size} className={className} />,
    blocked: <StatBlocked size={size} className={className} />,
    hot: <StatHot size={size} className={className} />,
    id: <StatID size={size} className={className} />,
    checking: <StatChecking size={size} className={className} />,
    chat: <StatChat size={size} className={className} />,
  };
  return <>{map[kind]}</>;
}

export type StatusKind =
  | "new" | "call" | "no-answer" | "callback" | "waiting"
  | "approved" | "rejected" | "paid" | "docs" | "sign"
  | "blocked" | "hot" | "id" | "checking" | "chat";

export type PipelineKind =
  | "underwriting" | "irrelevant" | "general-loan" | "vehicle"
  | "retention-yoni" | "archive" | "wati" | "spam" | "legal";

export function PipelineGlyph({ kind, size = 16, className }: { kind: PipelineKind; size?: number; className?: string }) {
  const map: Record<PipelineKind, React.ReactNode> = {
    underwriting: <PipeUnderwriting size={size} className={className} />,
    irrelevant: <PipeIrrelevant size={size} className={className} />,
    "general-loan": <PipeGeneralLoan size={size} className={className} />,
    vehicle: <PipeVehicle size={size} className={className} />,
    "retention-yoni": <PipeRetention size={size} className={className} />,
    archive: <PipeArchive size={size} className={className} />,
    wati: <PipeWati size={size} className={className} />,
    spam: <PipeSpam size={size} className={className} />,
    legal: <PipeLegal size={size} className={className} />,
  };
  return <>{map[kind]}</>;
}
