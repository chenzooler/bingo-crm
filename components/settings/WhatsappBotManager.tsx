"use client";
/**
 * בוט ווטסאפ — הגדרות החיבור ל-WATI (AppSetting "whatsapp-bot").
 * סימולציה בשלב זה: ההודעות נרשמות כפעילות, אין שליחה אמיתית. שכפול Yoatsim §2.
 */
import * as React from "react";
import Link from "next/link";
import { Bot, Eye, EyeOff, Plus, X, MessageSquareText, Zap } from "lucide-react";
import type { WhatsappBotConfig } from "@/lib/yoatsim/app-defaults";
import { cn } from "@/lib/utils";
import { AppToggle, SaveBadge, type SaveState } from "./AppSettingControls";

export default function WhatsappBotManager({ initial }: { initial: WhatsappBotConfig }) {
  const [config, setConfig] = React.useState<WhatsappBotConfig>(initial);
  const [saved, setSaved] = React.useState<WhatsappBotConfig>(initial);
  const [state, setState] = React.useState<SaveState>("saved");
  const [showToken, setShowToken] = React.useState(false);
  const [newSender, setNewSender] = React.useState("");

  const dirty = JSON.stringify(config) !== JSON.stringify(saved);

  const saveAll = async (next?: WhatsappBotConfig) => {
    const value = next ?? config;
    setState("saving");
    try {
      const res = await fetch("/api/settings/whatsapp-bot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      if (res.ok) {
        setSaved(value);
        setState("saved");
      } else setState("error");
    } catch {
      setState("error");
    }
  };

  const addSender = () => {
    const s = newSender.trim();
    if (!s || config.senders.includes(s)) return;
    setConfig({ ...config, senders: [...config.senders, s] });
    setNewSender("");
  };

  return (
    <div className="space-y-4">
      <div className="b-card p-5">
        <div className="b-eyebrow">תקשורת</div>
        <h2 className="text-xl font-extrabold text-bingo-black flex items-center gap-2.5 flex-wrap">
          בוט ווטסאפ
          <span className="b-chip b-chip-green">שכפול Yoatsim §2</span>
          <SaveBadge state={state} />
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          חיבור ה-WATI ששולח את תבניות הווטסאפ והאוטומציות — בשלב זה סימולציה בלבד.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Link href="/settings/templates" className="b-chip b-chip-blue text-[11.5px] hover:opacity-80 transition">
            <MessageSquareText className="size-3 inline ml-1" /> תבניות WATI
          </Link>
          <Link href="/settings/automations" className="b-chip b-chip-orange text-[11.5px] hover:opacity-80 transition">
            <Zap className="size-3 inline ml-1" /> אוטומציות
          </Link>
        </div>
      </div>

      {/* באנר סטטוס */}
      <div
        className={cn(
          "rounded-2xl border-2 px-4 py-3.5 flex items-center gap-3",
          saved.active
            ? "border-bingo-green bg-bingo-green-light/50"
            : "border-bingo-gray-150 bg-bingo-gray-50",
        )}
      >
        <Bot className={cn("size-6 shrink-0", saved.active ? "text-bingo-green-dark" : "text-bingo-gray-400")} />
        <div>
          <p className="text-[14px] font-bold text-bingo-black">
            {saved.active ? "הבוט מחובר (סימולציה)" : "הבוט כבוי — הודעות נרשמות כסימולציה בלבד"}
          </p>
          <p className="text-[11.5px] text-bingo-gray-500">
            ספק: {saved.provider} · מספר: <span dir="ltr" className="font-mono">{saved.phoneNumber || "—"}</span>
          </p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <span className="text-[12px] font-bold text-bingo-gray-500">פעיל</span>
          <AppToggle
            checked={config.active}
            onChange={(next) => {
              const value = { ...config, active: next };
              setConfig(value);
              void saveAll(value);
            }}
          />
        </div>
      </div>

      {/* טופס ההגדרות */}
      <div className="b-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-bold text-bingo-charcoal mb-1.5">ספק</label>
            <input readOnly value={config.provider} className="b-input h-10 text-[13px] w-full bg-bingo-gray-50 font-bold" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-bingo-charcoal mb-1.5">מספר טלפון</label>
            <input
              dir="ltr"
              className="b-input h-10 text-[13px] w-full font-mono"
              placeholder="9725XXXXXXXX"
              value={config.phoneNumber}
              onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-bingo-charcoal mb-1.5">שולחים (senders)</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {config.senders.map((s) => (
              <span key={s} className="b-chip b-chip-dark text-[11.5px] inline-flex items-center gap-1.5">
                <span dir="ltr" className="font-mono">{s}</span>
                <button
                  type="button"
                  title="הסר"
                  onClick={() => setConfig({ ...config, senders: config.senders.filter((x) => x !== s) })}
                  className="hover:text-bingo-green transition"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <input
              dir="ltr"
              className="b-input h-8 text-[12px] w-40 font-mono"
              placeholder="sender חדש"
              value={newSender}
              onChange={(e) => setNewSender(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addSender(); }}
            />
            <button type="button" onClick={addSender} className="b-icon b-icon-green !size-8" title="הוסף שולח">
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-bold text-bingo-charcoal mb-1.5">API Token</label>
            <div className="relative">
              <input
                dir="ltr"
                type={showToken ? "text" : "password"}
                className="b-input h-10 text-[13px] w-full font-mono pl-10"
                placeholder="Bearer token מ-WATI"
                value={config.apiToken}
                onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-bingo-gray-400 hover:text-bingo-black transition"
                title={showToken ? "הסתר" : "הצג"}
              >
                {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-bold text-bingo-charcoal mb-1.5">Webhook URL</label>
            <input
              dir="ltr"
              className="b-input h-10 text-[13px] w-full font-mono"
              placeholder="https://crm.bingoisrael.co.il/api/..."
              value={config.webhookUrl}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          {dirty && <span className="text-[11.5px] text-bingo-gray-400">יש שינויים שלא נשמרו</span>}
          <button type="button" onClick={() => void saveAll()} className="b-pill b-pill-dark b-pill-sm" disabled={state === "saving"}>
            שמור הגדרות
          </button>
        </div>
      </div>
    </div>
  );
}
