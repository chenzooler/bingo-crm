import { LeadsViewSwitcher } from "@/components/leads/LeadsViewSwitcher";
import { Sidebar } from "@/components/layout/Sidebar";
import { getPipeline } from "@/lib/data/static";
import { Search, Plus, Users } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ p?: string; s?: string }>;
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const pipe = sp.p ? getPipeline(sp.p) : undefined;

  return (
    <div className="flex gap-5 -m-4 sm:-m-6">
      {/* Smart views / stages filter — lives here, where it belongs */}
      <Sidebar />

      <div className="flex-1 min-w-0 space-y-4 py-4 sm:py-6 pl-4 sm:pl-6">
        {/* Page header */}
        <div className="b-card p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <span className="b-icon b-icon-green size-14">
              <Users className="size-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-[26px] font-bold tracking-tight text-bingo-black leading-none flex items-center gap-2.5">
                {pipe ? pipe.label : "כל הלידים"}
                <span className="b-chip b-chip-green tabular-nums">{pipe ? formatNumber(pipe.count) : "הכל"}</span>
              </h1>
              <p className="text-[13px] text-bingo-gray-500 mt-1.5">
                {pipe ? `${formatNumber(pipe.count)} לידים בתהליך זה` : "כל הלידים, התהליכים והמשימות — במקום אחד"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="b-pill b-pill-ghost b-pill-sm">
              <Search className="size-4" /> חיפוש מתקדם
            </button>
            <button className="b-pill b-pill-green b-pill-sm">
              <Plus className="size-4" strokeWidth={2.6} /> ליד חדש
            </button>
          </div>
        </div>

        <LeadsViewSwitcher pipeline={sp.p} status={sp.s} />
      </div>
    </div>
  );
}
