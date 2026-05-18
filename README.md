# BINGO CRM

CRM ייעודי לחברת בינגו ישראל - מימון בול בשבילך.

## טכנולוגיה
- Next.js 16 + React 19 + TypeScript
- Tailwind v4
- Framer Motion
- RTL Hebrew

## הרצה מקומית

```bash
npm install
npm run dev
```

ה-CRM יהיה זמין ב-http://localhost:3000

## Production (Coolify / Docker)

```bash
docker build -t bingo-crm .
docker run -p 3000:3000 bingo-crm
```

## מבנה
- `app/` - דפים (Next.js App Router)
- `components/` - רכיבים
- `lib/` - לוגיקה, types, data
- `research/` - מסמכי מחקר ואסטרטגיה
- `public/` - לוגו וקבצים סטטיים
