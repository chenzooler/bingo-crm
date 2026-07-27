"use client";
/**
 * מסך הגדרות הטלפוניה (Voicenter): סטטוס חיבור · טבלת שלוחות · שיוך שלוחה
 * לכל משתמש CRM (PATCH /api/users/[id]) · כתובת ה-webhook ל-CDR עם העתקה
 * ויצירת סוד חדש (PUT /api/settings/telephony) · שיחת בדיקה לעצמי.
 */
import * as React from "react";
import {
  PhoneCall, Copy, Check, RefreshCcw, Loader2, CircleCheck, CircleX, Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VoicenterExtension } from "@/lib/voicenter";

interface UserRow {
  id: number;
  name: string;
  emoji: string | null;
  sipExtension: string | null;
}

const WEBHOOK_BASE = "https://crm.bingoisrael.co.il/api/webhooks/voicenter";

function maskSip(sip: string): string {
  if (sip.length <= 3) return sip;
  return "•".repeat(sip.length - 3) + sip.slice(-3);
}

function randomSecret(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const buf = new Uint8Array(24);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => chars[b % chars.length]).join("");
}

export function TelephonySettings({ users: initialUsers, extensions, connectionError, webhookSecret: initialSecret }: {
  users: UserRow[];
  extensions: VoicenterExtension[];
  connectionError: string | null;
  webhookSecret: string;
}) {
  const [users, setUsers] = React.useState(initialUsers);
  const [savingUser, setSavingUser] = React.useState<number | null>(null);
  const [secret, setSecret] = React.useState(initialSecret);
  const [regenerating, setRegenerating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [testPhone, setTestPhone] = React.useState("");
  const [testState, setTestState] = React.useState<{ kind: "idle" | "busy" | "ok" | "err"; msg?: string }>({ kind: "idle" });

  const webhookUrl = `${WEBHOOK_BASE}/${secret}`;

  const saveExtension = async (userId: number, sip: string) => {
    setSavingUser(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sipExtension: sip || null }),
      });
      if (res.ok) {
        setUsers((u) => u.map((x) => (x.id === userId ? { ...x, sipExtension: sip || null } : x)));
      }
    } finally {
      setSavingUser(null);
    }
  };

  const regenerate = async () => {
    if (!window.confirm("ליצור סוד חדש? הכתובת הישנה תפסיק לעבוד - צריך לעדכן את Voicenter.")) return;
    setRegenerating(true);
    try {
      const next = randomSecret();
      const res = await fetch("/api/settings/telephony", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookSecret: next }),
      });
      if (res.ok) setSecret(next);
    } finally {
      setRegenerating(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* דפדפן חסם — המשתמש יעתיק ידנית */ }
  };

  const testCall = async () => {
    const phone = testPhone.trim();
    if (!phone) return;
    setTestState({ kind: "busy" });
    try {
      const res = await fetch("/api/calls/dial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setTestState({ kind: "ok", msg: "החיוג יצא - השלוחה שלך אמורה לצלצל עכשיו" });
      } else {
        setTestState({ kind: "err", msg: data?.error ?? "החיוג נכשל" });
      }
    } catch {
      setTestState({ kind: "err", msg: "החיוג נכשל - בדוק חיבור" });
    }
  };

  return (
    <div className="space-y-4">
      {/* ---------- סטטוס חיבור ---------- */}
      <div className="b-card !p-5">
        <div className="b-eyebrow">טלפוניה</div>
        <h2 className="text-lg font-extrabold text-bingo-black mb-3">Voicenter - חיבור המרכזייה</h2>
        {connectionError ? (
          <div className="flex items-center gap-2 rounded-2xl bg-status-red/10 border border-status-red/25 px-4 py-3 text-[13px] font-bold text-status-red">
            <CircleX className="size-4 shrink-0" />
            לא מחובר - {connectionError}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl bg-bingo-green/10 border border-bingo-green/30 px-4 py-3 text-[13px] font-bold text-bingo-black">
            <CircleCheck className="size-4 shrink-0 text-bingo-green-dark" />
            מחובר - {extensions.length} שלוחות בחשבון
          </div>
        )}
      </div>

      {/* ---------- טבלת השלוחות ---------- */}
      {extensions.length > 0 && (
        <div className="b-card !p-5">
          <h3 className="text-[15px] font-extrabold text-bingo-black mb-3">השלוחות בחשבון</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-right text-[11px] font-bold text-bingo-gray-400 border-b border-bingo-gray-100">
                  <th className="py-2 pl-3">שם</th>
                  <th className="py-2 pl-3">מספר</th>
                  <th className="py-2">SIP</th>
                </tr>
              </thead>
              <tbody>
                {extensions.map((ext) => (
                  <tr key={ext.sip} className="border-b border-bingo-gray-100 last:border-0">
                    <td className="py-2.5 pl-3 font-bold text-bingo-black">{ext.name}</td>
                    <td className="py-2.5 pl-3 tabular-nums" dir="ltr">{ext.phoneLabel || "-"}</td>
                    <td className="py-2.5 font-mono text-bingo-gray-500" dir="ltr">{maskSip(ext.sip)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------- שיוך שלוחה למשתמש ---------- */}
      <div className="b-card !p-5">
        <h3 className="text-[15px] font-extrabold text-bingo-black mb-1">שלוחה לכל נציג</h3>
        <p className="text-[12px] text-bingo-gray-500 font-semibold mb-3">
          בלי שלוחה - התותח לא יכול לחייג עבור הנציג.
        </p>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 flex-wrap">
              <span className="w-44 text-[13px] font-bold text-bingo-black truncate">
                {u.emoji ? `${u.emoji} ` : ""}{u.name}
              </span>
              <select
                className="b-input !w-64 text-[13px]"
                value={u.sipExtension ?? ""}
                disabled={savingUser === u.id || extensions.length === 0}
                onChange={(e) => void saveExtension(u.id, e.target.value)}
              >
                <option value="">ללא שלוחה</option>
                {extensions.map((ext) => (
                  <option key={ext.sip} value={ext.sip}>
                    {ext.name}{ext.phoneLabel ? ` (${ext.phoneLabel})` : ""}
                  </option>
                ))}
              </select>
              {savingUser === u.id && <Loader2 className="size-4 animate-spin text-bingo-gray-400" />}
              {u.sipExtension && savingUser !== u.id && (
                <span className="b-chip b-chip-green text-[11px]">מחובר</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Webhook CDR ---------- */}
      <div className="b-card !p-5">
        <h3 className="text-[15px] font-extrabold text-bingo-black mb-1 flex items-center gap-2">
          <Webhook className="size-4" /> כתובת עדכוני שיחות (CDR)
        </h3>
        <p className="text-[12px] text-bingo-gray-500 font-semibold mb-3">
          מוסרים את הכתובת הזו לתמיכה של Voicenter - הם ישלחו אליה דיווח על כל שיחה שהסתיימה.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <code className="rounded-xl bg-bingo-gray-100 px-3 py-2 text-[12px] font-mono break-all" dir="ltr">
            {webhookUrl}
          </code>
          <button type="button" onClick={() => void copyUrl()} className="b-pill b-pill-ghost !py-2 text-[12.5px]">
            {copied ? <Check className="size-4 text-bingo-green-dark" /> : <Copy className="size-4" />}
            {copied ? "הועתק" : "העתק"}
          </button>
          <button type="button" onClick={() => void regenerate()} disabled={regenerating} className="b-pill b-pill-ghost !py-2 text-[12.5px]">
            {regenerating ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
            צור סוד חדש
          </button>
        </div>
        {secret === "bingo-cdr-CHANGE-ME" && (
          <p className="text-[12px] font-bold text-status-orange mt-2">
            זהו סוד ברירת המחדל - לחץ "צור סוד חדש" לפני מסירת הכתובת ל-Voicenter.
          </p>
        )}
      </div>

      {/* ---------- שיחת בדיקה ---------- */}
      <div className="b-card !p-5">
        <h3 className="text-[15px] font-extrabold text-bingo-black mb-1 flex items-center gap-2">
          <PhoneCall className="size-4" /> שיחת בדיקה לעצמי
        </h3>
        <p className="text-[12px] text-bingo-gray-500 font-semibold mb-3">
          מחייג מהשלוחה שלך למספר שתזין - דורש שלוחה מוגדרת למשתמש הנוכחי.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="tel"
            dir="ltr"
            placeholder="05XXXXXXXX"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            className="b-input !w-48 text-[13px] tabular-nums"
          />
          <button
            type="button"
            onClick={() => void testCall()}
            disabled={testState.kind === "busy" || !testPhone.trim()}
            className="b-pill b-pill-green !py-2 text-[13px] disabled:opacity-50"
          >
            {testState.kind === "busy" ? <Loader2 className="size-4 animate-spin" /> : <PhoneCall className="size-4" />}
            חייג אליי
          </button>
        </div>
        {testState.msg && (
          <p className={cn(
            "text-[12.5px] font-bold mt-2",
            testState.kind === "ok" ? "text-bingo-green-dark" : "text-status-red",
          )}>
            {testState.msg}
          </p>
        )}
      </div>
    </div>
  );
}
