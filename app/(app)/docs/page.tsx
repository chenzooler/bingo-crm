import Link from "next/link";
import fs from "node:fs/promises";
import path from "node:path";
import { FileText, ArrowLeft } from "lucide-react";

const DOCS: { slug: string; file: string; title: string; description: string; emoji: string }[] = [
  {
    slug: "statuses",
    file: "01-statuses-and-dropdowns.md",
    title: "סטטוסים ושדות יועצים",
    description: "מיפוי מלא של כל הסטטוסים, תהליכים, משתמשים ושדות מ-יועצים",
    emoji: "📋",
  },
  {
    slug: "design-system",
    file: "02-design-system.md",
    title: "מערכת עיצוב",
    description: "פלטת צבעים, טיפוגרפיה ועקרונות המותג של בינגו",
    emoji: "🎨",
  },
  {
    slug: "pipelines",
    file: "03-pipelines.md",
    title: "מפת תהליכים",
    description: "9 תהליכים ו-60+ סטטוסים — תיעוד מלא של הזרימה העסקית",
    emoji: "🔀",
  },
  {
    slug: "master-spec",
    file: "04-master-spec.md",
    title: "מפרט מערכת",
    description: "המפרט הטכני המקורי של ה-CRM החדש",
    emoji: "📐",
  },
  {
    slug: "strategy",
    file: "05-strategy-master.md",
    title: "אסטרטגיה ראשית",
    description: "ארכיטקטורת המערכת, tech stack, מודולים, מפת דרכים 8 שלבים ו-KPIs",
    emoji: "🎯",
  },
  {
    slug: "integrations",
    file: "06-integrations-deep-dive.md",
    title: "אינטגרציות",
    description: "WATI, CallMarker, GreenInvoice, BDI, AI Call Analysis, Power Dialer",
    emoji: "🔌",
  },
  {
    slug: "agent-experience",
    file: "07-agent-experience.md",
    title: "חוויית הנציג",
    description: "5 עקרונות UX, יום של נציג, 10 רכיבי UX ייחודיים",
    emoji: "🧑‍💼",
  },
];

export default async function DocsIndexPage() {
  const researchDir = path.join(process.cwd(), "research");
  const sizes = await Promise.all(
    DOCS.map(async (d) => {
      try {
        const stat = await fs.stat(path.join(researchDir, d.file));
        return stat.size;
      } catch {
        return 0;
      }
    })
  );
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
          מסמכי מחקר
          <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
        </h1>
        <p className="text-sm text-bingo-gray-600 mt-1.5">
          כל המחקר והאסטרטגיה למערכת CRM של בינגו — מוכן לקריאה בדפדפן.
        </p>
      </div>

      <div className="grid gap-3">
        {DOCS.map((d, i) => (
          <Link
            key={d.slug}
            href={`/docs/${d.slug}`}
            className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-bingo-gray-200 hover:border-bingo-green/50 hover:bingo-shadow-lg transition-all"
          >
            <div className="size-14 rounded-2xl bg-gradient-to-bl from-bingo-green/15 to-bingo-green/5 border border-bingo-green/30 inline-flex items-center justify-center text-3xl shrink-0">
              {d.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-0.5">
                <FileText className="size-3" />
                <span>מסמך {i + 1} · {sizes[i] ? `${Math.round(sizes[i] / 1024)} KB` : ""}</span>
              </div>
              <h2 className="text-lg font-extrabold text-bingo-black group-hover:text-bingo-green-dark">{d.title}</h2>
              <p className="text-[13px] text-bingo-gray-600 mt-0.5">{d.description}</p>
            </div>
            <ArrowLeft className="size-5 text-bingo-gray-400 group-hover:text-bingo-green-dark group-hover:-translate-x-1 transition shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
