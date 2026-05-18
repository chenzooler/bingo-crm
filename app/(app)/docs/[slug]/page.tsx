import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import { ChevronRight } from "lucide-react";

const DOCS: Record<string, { file: string; title: string; emoji: string }> = {
  statuses: { file: "01-statuses-and-dropdowns.md", title: "סטטוסים ושדות יועצים", emoji: "📋" },
  "design-system": { file: "02-design-system.md", title: "מערכת עיצוב", emoji: "🎨" },
  pipelines: { file: "03-pipelines.md", title: "מפת תהליכים", emoji: "🔀" },
  "master-spec": { file: "04-master-spec.md", title: "מפרט מערכת", emoji: "📐" },
  strategy: { file: "05-strategy-master.md", title: "אסטרטגיה ראשית", emoji: "🎯" },
  integrations: { file: "06-integrations-deep-dive.md", title: "אינטגרציות", emoji: "🔌" },
  "agent-experience": { file: "07-agent-experience.md", title: "חוויית הנציג", emoji: "🧑‍💼" },
};

// Configure marked
marked.setOptions({ gfm: true, breaks: false });

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();

  const filePath = path.join(process.cwd(), "research", doc.file);
  let content = "";
  try {
    content = await fs.readFile(filePath, "utf-8");
  } catch {
    notFound();
  }

  const html = await marked.parse(content);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-bingo-gray-500 mb-3">
        <Link href="/docs" className="hover:underline font-bold">מסמכי מחקר</Link>
        <ChevronRight className="size-3 -scale-x-100" />
        <span>{doc.title}</span>
      </div>

      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-bingo-gray-100">
          <div className="size-12 rounded-2xl bg-gradient-to-bl from-bingo-green/15 to-bingo-green/5 border border-bingo-green/30 inline-flex items-center justify-center text-2xl">
            {doc.emoji}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">מסמך מחקר</div>
            <h1 className="text-2xl sm:text-3xl font-black text-bingo-black">{doc.title}</h1>
          </div>
        </div>

        <div
          className="markdown-doc text-bingo-charcoal text-[15px] leading-[1.75]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white border border-bingo-gray-200 hover:bg-bingo-gray-100 text-bingo-charcoal text-xs font-bold transition"
        >
          <ChevronRight className="size-3.5" />
          חזרה למסמכים
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-bingo-black hover:bg-bingo-charcoal text-white text-xs font-bold transition"
        >
          חזרה לדשבורד
          <ChevronRight className="size-3.5 -scale-x-100" />
        </Link>
      </div>
    </div>
  );
}
