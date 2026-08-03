// חיפוש עברי משותף: התאמות תחילית מדורגות לפני התאמות "מכיל", עד 12 תוצאות.
export const MAX_RESULTS = 12;

export function rankSearch<T>(
  items: T[],
  q: string,
  getText: (item: T) => string,
  max = MAX_RESULTS
): T[] {
  const query = q.trim();
  if (!query) return items.slice(0, max);
  const prefix: T[] = [];
  const contains: T[] = [];
  for (const item of items) {
    const text = getText(item);
    if (text.startsWith(query)) {
      prefix.push(item);
    } else if (text.includes(query)) {
      contains.push(item);
    }
    if (prefix.length >= max) break;
  }
  return [...prefix, ...contains].slice(0, max);
}
