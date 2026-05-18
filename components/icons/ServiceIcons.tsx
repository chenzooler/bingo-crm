import * as React from "react";

/** Clean Bingo-style service icons - line art with green accents matching bingoisrael.co.il */

export function PurposeIcon({ purpose, className = "size-5" }: { purpose?: string; className?: string }) {
  switch (purpose) {
    case "debt-cover":
      return <DebtIcon className={className} />;
    case "family-help":
      return <FamilyIcon className={className} />;
    case "studies":
      return <StudiesIcon className={className} />;
    case "vacation":
      return <VacationIcon className={className} />;
    case "event":
      return <EventIcon className={className} />;
    case "business":
      return <BusinessIcon className={className} />;
    case "renovation":
      return <RenovationIcon className={className} />;
    case "housing":
      return <HousingIcon className={className} />;
    case "shopping":
      return <ShoppingIcon className={className} />;
    case "vehicle":
      return <VehicleIcon className={className} />;
    case "health":
      return <HealthIcon className={className} />;
    default:
      return <DebtIcon className={className} />;
  }
}

export function DebtIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="7" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FamilyIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="2.5" />
      <circle cx="15" cy="7" r="2.5" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
      <path d="M11 20c0-3 2-5 5-5s5 2 5 5" />
    </svg>
  );
}

export function StudiesIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9l10-5 10 5-10 5L2 9z" />
      <path d="M6 11v5a4 4 0 008 0v-5" />
      <path d="M22 9v6" />
    </svg>
  );
}

export function VacationIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 12.5L20 21l-9-3.5L2.5 21" />
      <path d="M21.5 12.5l-15 5L2 11l5.5 1.5" />
      <circle cx="6.5" cy="7" r="2" />
    </svg>
  );
}

export function EventIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M4 11h16" />
      <circle cx="12" cy="15" r="2" />
    </svg>
  );
}

export function BusinessIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M9 8V5a2 2 0 012-2h2a2 2 0 012 2v3" />
      <path d="M3 14h18" />
    </svg>
  );
}

export function RenovationIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 7l3-3 4 4-3 3" />
      <path d="M14 7l-7 7-3 7 7-3 7-7" />
      <path d="M9 13l3 3" />
    </svg>
  );
}

export function HousingIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

export function ShoppingIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h14l-1.5 11a2 2 0 01-2 1.7H8.5a2 2 0 01-2-1.7L5 8z" />
      <path d="M9 8V5a3 3 0 016 0v3" />
    </svg>
  );
}

export function VehicleIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14l2-6a2 2 0 012-1.5h10a2 2 0 012 1.5l2 6v4H3v-4z" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

export function HealthIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-5-9-10a5 5 0 019-3 5 5 0 019 3c-2 5-9 10-9 10z" />
    </svg>
  );
}

/** Bingo brand ball - green sphere */
export function BingoBall({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id="bingoBallGrad" cx="35%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#D9FFB8" />
          <stop offset="35%" stopColor="#7DFF40" />
          <stop offset="70%" stopColor="#50FF0A" />
          <stop offset="100%" stopColor="#2EA10D" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#bingoBallGrad)" />
      <ellipse cx="11.5" cy="11" rx="5" ry="3.2" fill="white" opacity="0.32" />
    </svg>
  );
}

/** Section icons - line, monochrome, brand-aligned */
export function SectionIcon({ kind, className = "size-4" }: { kind: SectionKind; className?: string }) {
  const map: Record<SectionKind, React.ReactNode> = {
    intake: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 3v4a1 1 0 001 1h4" />
        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    ),
    credit: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M2 11h20M6 16h2M10 16h4" />
      </svg>
    ),
    pulse: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 12h4l2-7 4 14 2-7h6" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    ),
    income: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M9 9h4.5a2 2 0 010 4H9.5a2 2 0 000 4H15" />
      </svg>
    ),
    bank: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 21h18M5 21V11M9 21V11M15 21V11M19 21V11M3 11h18L12 3 3 11z" />
      </svg>
    ),
    home: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
    car: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 14l2-6a2 2 0 012-1.5h10a2 2 0 012 1.5l2 6v4H3v-4z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
    lenders: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    offer: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 12V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14l4-2 4 2 4-2 4 2v-3" />
        <path d="M8 8h8M8 12h6" />
      </svg>
    ),
    script: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 7c0-2 2-4 4-4h10c2 0 4 2 4 4v10c0 2-2 4-4 4H7c-2 0-4-2-4-4V7z" />
        <path d="M8 9h8M8 13h5M8 17h6" />
      </svg>
    ),
    forms: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 3v4a1 1 0 001 1h4" />
        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
        <path d="M16 14l-4 4-2-2" />
      </svg>
    ),
    files: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
      </svg>
    ),
    calc: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h6M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
      </svg>
    ),
  };
  return <>{map[kind]}</>;
}

export type SectionKind =
  | "intake"
  | "credit"
  | "pulse"
  | "user"
  | "income"
  | "bank"
  | "home"
  | "car"
  | "lenders"
  | "offer"
  | "script"
  | "forms"
  | "files"
  | "calc";

/** Lender brand mark - colored chip with abbreviation */
export function LenderMark({ code, size = 36 }: { code: string; size?: number }) {
  const brands: Record<string, { abbr: string; bg: string; fg: string }> = {
    isracard: { abbr: "ית", bg: "linear-gradient(135deg,#0066B3,#003B73)", fg: "#FFFFFF" },
    cal: { abbr: "כאל", bg: "linear-gradient(135deg,#E40046,#A8003A)", fg: "#FFFFFF" },
    max: { abbr: "מקס", bg: "linear-gradient(135deg,#1A1A1A,#000000)", fg: "#FFFFFF" },
    direct: { abbr: "דר", bg: "linear-gradient(135deg,#FF7A00,#CC5C00)", fg: "#FFFFFF" },
    phoenix: { abbr: "פנ", bg: "linear-gradient(135deg,#7C2D8E,#4A1B5A)", fg: "#FFFFFF" },
    blender: { abbr: "בל", bg: "linear-gradient(135deg,#00A6F1,#0077B6)", fg: "#FFFFFF" },
    "jerusalem-bank": { abbr: "ירו", bg: "linear-gradient(135deg,#003F8C,#001E4A)", fg: "#FFFFFF" },
    "personal-bank": { abbr: "ב.פ", bg: "linear-gradient(135deg,#6E6D69,#353432)", fg: "#FFFFFF" },
    "other-bank": { abbr: "ב.א", bg: "linear-gradient(135deg,#9A9994,#6E6D69)", fg: "#FFFFFF" },
    pension: { abbr: "פנ", bg: "linear-gradient(135deg,#16A085,#0E6655)", fg: "#FFFFFF" },
    insurance: { abbr: "ב.ב", bg: "linear-gradient(135deg,#2980B9,#1B4F72)", fg: "#FFFFFF" },
    fama: { abbr: "פמה", bg: "linear-gradient(135deg,#F39C12,#B9770E)", fg: "#FFFFFF" },
    "direct-finance": { abbr: "מ.י", bg: "linear-gradient(135deg,#16A085,#0E6655)", fg: "#FFFFFF" },
  };
  const b = brands[code] || brands["other-bank"];
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl font-black flex-shrink-0 select-none"
      style={{
        width: size,
        height: size,
        background: b.bg,
        color: b.fg,
        fontSize: size * (b.abbr.length > 2 ? 0.32 : 0.42),
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.3), 0 2px 6px rgba(20,19,17,.12)",
      }}
    >
      {b.abbr}
    </span>
  );
}
