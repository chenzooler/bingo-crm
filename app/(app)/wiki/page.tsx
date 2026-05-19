"use client";
import * as React from "react";
import { BookOpen, Search, ChevronLeft, Pin, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ARTICLES = [
  { id: 1, category: "פתיחת שיחה", title: "תסריט פתיחה לליד חדש - בסיסי", excerpt: "התסריט הסטנדרטי לכל ליד שמתקבל מ-Facebook/דף נחיתה", reads: 1247, pinned: true, updated: "אתמול" },
  { id: 2, category: "פתיחת שיחה", title: "פתיחה ללקוח שכבר ביקש בעבר וחזר", excerpt: "כיצד לפתוח שיחה עם לקוח חוזר ולגרום לו להרגיש מוערך", reads: 423, pinned: false, updated: "השבוע" },
  { id: 3, category: "התנגדויות", title: '"יקר מדי" - 5 דרכי תגובה מנצחות', excerpt: "התנגדות #1 של לקוחות וההצלחה הוכחה ב-73%", reads: 2156, pinned: true, updated: "אתמול" },
  { id: 4, category: "התנגדויות", title: '"צריך לחשוב על זה" - איך לסגור עכשיו', excerpt: "טיפול בלקוח מהסס בלי להלחיץ אותו", reads: 1893, pinned: false, updated: "השבוע" },
  { id: 5, category: "BDI", title: "מתי לבצע בדיקת BDI - מדריך החלטה", excerpt: "אסטרטגיה: מתי שווה, מתי לחכות, מה לעשות עם תוצאה גבולית", reads: 891, pinned: false, updated: "חודש שעבר" },
  { id: 6, category: "BDI", title: "איך להסביר ללקוח את משמעות הציון", excerpt: "הלקוח לא חייב להבין הכל - הנה רק מה שצריך להעביר", reads: 567, pinned: false, updated: "חודש שעבר" },
  { id: 7, category: "גופי מימון", title: "פמה vs מימון ישיר - מתי כל אחד", excerpt: "השוואה מפורטת ואיך לבחור לפי פרופיל הלקוח", reads: 1432, pinned: true, updated: "השבוע" },
  { id: 8, category: "גופי מימון", title: "כאל - הגוף המהיר ביותר", excerpt: "מתי כדאי להפנות לכאל, איך לבקש סקירה תוך 5 דק", reads: 678, pinned: false, updated: "חודשיים" },
  { id: 9, category: "Compliance", title: "מה אסור להגיד בשיחה - הרשימה המלאה", excerpt: "חובה לקרוא - מילים שיוצרות לנו בעיה משפטית", reads: 3421, pinned: true, updated: "השבוע" },
  { id: 10, category: "Compliance", title: "GDPR ואיסור פרסום - מה הכללים", excerpt: "מה לא לעשות גם אם הלקוח מבקש", reads: 1234, pinned: false, updated: "חודש שעבר" },
  { id: 11, category: "מערכת", title: "איך משתמשים בתותח השיחות", excerpt: "מדריך מפורט שלב אחר שלב", reads: 4521, pinned: true, updated: "אתמול" },
  { id: 12, category: "מערכת", title: "Cmd+K - 15 קיצורי דרך שיחסכו שעות", excerpt: "כל קיצורי המקלדת במערכת", reads: 1543, pinned: false, updated: "השבוע" },
];

const CATEGORIES = ["הכל", "פתיחת שיחה", "התנגדויות", "BDI", "גופי מימון", "Compliance", "מערכת"];

export default function WikiPage() {
  const [category, setCategory] = React.useState("הכל");
  const [query, setQuery] = React.useState("");

  const filtered = ARTICLES.filter((a) => {
    if (category !== "הכל" && a.category !== category) return false;
    if (query && !`${a.title} ${a.excerpt}`.includes(query)) return false;
    return true;
  });

  const pinned = filtered.filter((a) => a.pinned);
  const others = filtered.filter((a) => !a.pinned);

  return (
    <div className="max-w-[1300px] space-y-4">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 inline-flex items-center gap-1 mb-1">
          <BookOpen className="size-3" /> מאגר ידע
        </div>
        <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
          מאגר ידע נציגים
          <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
        </h1>
        <p className="text-sm text-bingo-gray-600 mt-1.5">מדריכים, תסריטים, התנגדויות, וכל מה שצריך לדעת. {ARTICLES.length} מאמרים.</p>
      </div>

      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
        <div className="relative mb-4">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-bingo-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש מאמר, תסריט, התנגדות..."
            className="w-full h-12 rounded-2xl border-2 border-bingo-gray-200 bg-white pr-11 pl-4 text-sm font-medium hover:border-bingo-gray-300 focus:border-bingo-green focus:outline-none focus:ring-4 focus:ring-bingo-green/15"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn("h-8 px-3 rounded-lg text-xs font-bold transition", category === c ? "bg-bingo-black text-white" : "bg-bingo-gray-100 text-bingo-charcoal hover:bg-bingo-gray-200")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {pinned.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-bingo-gray-500 uppercase tracking-wider mb-2 inline-flex items-center gap-1.5">
            <Pin className="size-3" /> מוצמדים
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {pinned.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold text-bingo-gray-500 uppercase tracking-wider mb-2">כל המאמרים ({others.length})</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {others.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <button className="text-right rounded-2xl bg-white border border-bingo-gray-200 hover:border-bingo-green/40 hover:bingo-shadow-sm hover:-translate-y-0.5 transition p-4 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-bold text-bingo-green-dark bg-bingo-green/15 rounded-full px-2 py-0.5">{article.category}</span>
        {article.pinned && <Pin className="size-3 text-amber-500 fill-amber-500" />}
      </div>
      <h3 className="text-base font-extrabold text-bingo-black mb-1 leading-snug">{article.title}</h3>
      <p className="text-[12px] text-bingo-gray-600 leading-relaxed line-clamp-2">{article.excerpt}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-bingo-gray-100 text-[10px] text-bingo-gray-500">
        <span className="inline-flex items-center gap-1">
          <Star className="size-3" /> {article.reads.toLocaleString()} קריאות
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3" /> {article.updated}
        </span>
      </div>
    </button>
  );
}
