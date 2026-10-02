import { z } from "zod";
const short = z.string().trim().min(1).max(300);
const safeMedia = z.string().max(2000).refine((value) => {
  if (/^\/(?!\/)[^\s\\]+$/.test(value)) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "Gebruik HTTPS of een lokaal pad zoals /videos/uitleg.mp4.");
export const contentSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  title: short, summary: short,
  topics: z.array(short).min(1).max(20),
  keywords: z.array(short).min(1).max(50),
  exampleQueries: z.array(short).min(1).max(30),
  languageLevel: z.enum(["simpel", "normaal", "uitgebreid"]),
  paragraphs: z.array(z.string().trim().min(1).max(20000)).min(1).max(30),
  video: z.object({ url: safeMedia, captionsUrl: safeMedia }).nullable(),
  reflectionQuestion: short, suggestedAction: short,
  sources: z.array(z.object({title: short, url: z.string().url().max(2000).refine(v => v.startsWith("https:"))})).min(1).max(20),
  author: short,
});
export type PsychoContent = z.infer<typeof contentSchema>;
export type PsychoRecord = {
  content: PsychoContent; revision: number; status: "draft" | "published";
  review: null | {reviewer: string; reviewedAt: string; revision: number};
};
export const reviewLabels = {
  accuracy: "Inhoud en bronnen zijn gecontroleerd.",
  language: "De tekst is begrijpelijk en niet-stigmatiserend.",
  applicability: "Toepasbaarheid en beperkingen zijn duidelijk.",
  media: "Eventuele video en ondertiteling zijn bekeken (of niet van toepassing).",
} as const;
export type ReviewChecks = Record<keyof typeof reviewLabels, boolean>;
export const emptyChecks = (): ReviewChecks => ({accuracy:false, language:false, applicability:false, media:false});
export const isPublished = (r: PsychoRecord) => r.status === "published" && r.review?.revision === r.revision;
function normalize(s: string) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim(); }
const stopWords = new Set(("ik je jij het de een en of dat die is ben zijn om te van aan met voor mij me mijn wat hoe waarom kan wil heb niet altijd").split(" "));
export function searchPsychoeducation(records: PsychoRecord[], query: string): PsychoRecord[] {
  const published = records.filter(isPublished), q = normalize(query);
  if (!q) return [...published].sort((a,b) => a.content.title.localeCompare(b.content.title,"nl"));
  const tokens = [...new Set(q.split(" "))].filter(t => t.length > 1 && !stopWords.has(t));
  if (!tokens.length) return [];
  return published.map(record => {
    const c = record.content;
    const words = (s: string) => new Set(normalize(s).split(" "));
    const title = words(c.title), tags = words([...c.topics,...c.keywords].join(" "));
    const examples = c.exampleQueries.map(normalize), exampleWords = words(examples.join(" ")), summary = words(c.summary);
    let score = 0;
    for (const t of tokens) score += (title.has(t)?5:0)+(tags.has(t)?4:0)+(exampleWords.has(t)?3:0)+(summary.has(t)?1:0);
    if (examples.some(e => e === q || (` ${q} `).includes(` ${e} `))) score += 10;
    return {record, score};
  }).filter(x => x.score >= 3).sort((a,b) => b.score-a.score || a.record.content.title.localeCompare(b.record.content.title,"nl")).map(x=>x.record);
}
