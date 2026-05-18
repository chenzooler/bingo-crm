"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft, Plus, BarChart3, ListChecks, Users, FileText, ChevronLeft } from "lucide-react";
import { LEADS } from "@/lib/data/leads";
import { PIPELINES, USERS } from "@/lib/data/static";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

type Cmd =
  | { kind: "lead"; id: string; name: string; phone?: string; idNumber?: string }
  | { kind: "page"; href: string; label: string; icon: React.ReactNode; shortcut?: string }
  | { kind: "pipeline"; key: string; label: string; emoji: string }
  | { kind: "user"; id: number; name: string; emoji?: string };

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const pages: Cmd[] = [
    { kind: "page", href: "/dashboard", label: "דשבורד", icon: <BarChart3 className="size-4" />, shortcut: "G D" },
    { kind: "page", href: "/tasks", label: "משימות", icon: <ListChecks className="size-4" />, shortcut: "G T" },
    { kind: "page", href: "/reports", label: "דוחות", icon: <FileText className="size-4" />, shortcut: "G R" },
    { kind: "page", href: "/dashboard?new=1", label: "הוספת ליד חדש", icon: <Plus className="size-4" />, shortcut: "C" },
  ];

  const search = q.trim();
  const leadsMatch = LEADS.filter(
    (l) =>
      !search ||
      l.fullName.includes(search) ||
      l.idNumber?.includes(search) ||
      l.phone?.includes(search) ||
      l.email?.includes(search)
  ).slice(0, 6);
  const pipelinesMatch: Cmd[] = PIPELINES.filter((p) => !search || p.label.includes(search))
    .slice(0, 5)
    .map((p) => ({ kind: "pipeline", key: p.key, label: p.label, emoji: p.emoji }));
  const usersMatch: Cmd[] = USERS.filter((u) => !search || u.name.includes(search))
    .slice(0, 4)
    .map((u) => ({ kind: "user", id: u.id, name: u.name, emoji: u.emoji }));
  const pagesMatch = pages.filter((p) => !search || (p.kind === "page" && p.label.includes(search)));

  function go(cmd: Cmd) {
    setOpen(false);
    setQ("");
    if (cmd.kind === "lead") router.push(`/leads/${cmd.id}`);
    if (cmd.kind === "page") router.push(cmd.href);
    if (cmd.kind === "pipeline") router.push(`/leads?p=${cmd.key}`);
    if (cmd.kind === "user") router.push(`/leads?owner=${cmd.id}`);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bingo-onyx/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-[14vh] z-50 w-[92vw] max-w-2xl -translate-x-1/2 rounded-2xl bg-white bingo-shadow-xl border border-bingo-gray-200 overflow-hidden animate-fade-in">
          <Dialog.Title className="sr-only">חיפוש מהיר</Dialog.Title>
          <div className="flex items-center gap-3 px-5 h-14 border-b border-bingo-gray-150">
            <Search className="size-5 text-bingo-gray-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="חיפוש לידים, תהליכים, פעולות..."
              className="flex-1 bg-transparent outline-none text-base font-medium placeholder:text-bingo-gray-400"
            />
            <kbd className="text-[10px] font-mono font-semibold text-bingo-gray-500 bg-bingo-gray-100 rounded px-1.5 py-0.5 border border-bingo-gray-200">ESC</kbd>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {search === "" && pagesMatch.length > 0 && (
              <Group title="ניווט מהיר">
                {pagesMatch.map((c) =>
                  c.kind === "page" ? (
                    <Row key={c.href} onSelect={() => go(c)} icon={c.icon} label={c.label} shortcut={c.shortcut} />
                  ) : null
                )}
              </Group>
            )}

            {leadsMatch.length > 0 && (
              <Group title={`לידים${search ? ` (${leadsMatch.length})` : ""}`}>
                {leadsMatch.map((l) => (
                  <Row
                    key={l.id}
                    onSelect={() => go({ kind: "lead", id: l.id, name: l.fullName })}
                    icon={<Avatar size="sm" name={l.fullName} />}
                    label={l.fullName}
                    sublabel={[l.idNumber, l.phone].filter(Boolean).join(" · ")}
                  />
                ))}
              </Group>
            )}

            {pipelinesMatch.length > 0 && (
              <Group title="תהליכים">
                {pipelinesMatch.map((p) =>
                  p.kind === "pipeline" ? (
                    <Row
                      key={p.key}
                      onSelect={() => go(p)}
                      icon={<span className="text-base">{p.emoji}</span>}
                      label={p.label}
                    />
                  ) : null
                )}
              </Group>
            )}

            {usersMatch.length > 0 && search !== "" && (
              <Group title="משתמשים">
                {usersMatch.map((u) =>
                  u.kind === "user" ? (
                    <Row
                      key={u.id}
                      onSelect={() => go(u)}
                      icon={<Avatar size="sm" name={u.name} emoji={u.emoji} />}
                      label={u.name}
                    />
                  ) : null
                )}
              </Group>
            )}

            {search && leadsMatch.length === 0 && pipelinesMatch.length === 0 && usersMatch.length === 0 && (
              <div className="py-12 text-center">
                <Search className="size-7 text-bingo-gray-300 mx-auto mb-3" />
                <div className="text-sm font-medium text-bingo-gray-500">אין תוצאות עבור "{search}"</div>
              </div>
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-bingo-gray-150 flex items-center justify-between text-[11px] text-bingo-gray-500">
            <div className="flex items-center gap-3">
              <Hint k="↑↓" t="ניווט" />
              <Hint k="↵" t="פתיחה" />
              <Hint k="ESC" t="סגירה" />
            </div>
            <span>BINGO CRM · ⌘K</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5 last:mb-0">
      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-bingo-gray-400">{title}</div>
      <div>{children}</div>
    </div>
  );
}

function Row({
  icon,
  label,
  sublabel,
  shortcut,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-3 h-11 rounded-lg text-right hover:bg-bingo-green/12 active:bg-bingo-green/20 group transition"
    >
      <span className="size-8 inline-flex items-center justify-center rounded-md bg-bingo-gray-100 text-bingo-charcoal group-hover:bg-white">
        {icon}
      </span>
      <span className="flex-1 text-sm font-bold text-bingo-black truncate">{label}</span>
      {sublabel && <span className="text-xs text-bingo-gray-500 hidden sm:block">{sublabel}</span>}
      {shortcut && <kbd className="text-[10px] font-mono text-bingo-gray-500 bg-bingo-gray-100 rounded px-1.5 py-0.5 border border-bingo-gray-200">{shortcut}</kbd>}
      <ChevronLeft className="size-3.5 text-bingo-gray-400 opacity-0 group-hover:opacity-100 transition" />
    </button>
  );
}

function Hint({ k, t }: { k: string; t: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <kbd className="font-mono font-semibold bg-white rounded px-1.5 py-0.5 border border-bingo-gray-200">{k}</kbd>
      <span>{t}</span>
    </span>
  );
}
