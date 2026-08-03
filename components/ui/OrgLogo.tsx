"use client";
// לוגו ארגון (בנק / חברת ביטוח) בתוך "גלולה" לבנה עם מסגרת.
// אם התמונה נכשלת - נופל למונוגרמה: האות הראשונה של השם, דיו על לבן.
import { useState } from "react";

interface OrgLogoProps {
  /** נתיב ציבורי, למשל "/logos/banks/leumi.svg" */
  src?: string | null;
  /** שם עברי מלא - לצורך alt ולמונוגרמת הנפילה */
  name: string;
  size?: number;
}

export default function OrgLogo({ src, name, size = 24 }: OrgLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;
  const initial = name.trim().charAt(0) || "?";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 999,
        background: "#FFFFFF",
        border: "1px solid #E6E8E4",
        overflow: "hidden",
        flexShrink: 0,
      }}
      aria-hidden={!showImage}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          width={size - 6}
          height={size - 6}
          style={{ objectFit: "contain", width: size - 6, height: size - 6 }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          style={{
            color: "#292929",
            fontSize: Math.round(size * 0.45),
            fontWeight: 600,
            lineHeight: 1,
            fontFamily: "inherit",
            userSelect: "none",
          }}
        >
          {initial}
        </span>
      )}
    </span>
  );
}
