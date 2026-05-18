import { Suspense } from "react";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { getPipeline } from "@/lib/data/static";
import { Search, Plus, Sparkles } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ p?: string; s?: string }>;
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const pipe = sp.p ? getPipeline(sp.p) : undefined;

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {pipe && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 inline-flex items-center gap-1">
                <Sparkles className="size-3" /> {pipe.emoji} {pipe.label}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
            {pipe ? pipe.label : "כל הלידים"}
            <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
          </h1>
          <p className="text-sm text-bingo-gray-600 mt-1.5">
            {pipe
              ? `${formatNumber(pipe.count)} לידים בתהליך זה`
              : "כל הלידים, התהליכים והמשימות במקום אחד"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-xl bg-white border border-bingo-gray-200 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-bingo-gray-100 transition">
            <Search className="size-3.5" /> חיפוש מתקדם
          </button>
          <button className="h-9 px-3 rounded-xl bg-bingo-black text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-bingo-charcoal transition bingo-shadow">
            <Plus className="size-3.5" /> ליד חדש
          </button>
        </div>
      </div>

      <Suspense fallback={null}>
        <LeadsTable pipeline={sp.p} status={sp.s} />
      </Suspense>
    </div>
  );
}
