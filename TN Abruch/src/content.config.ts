import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

/**
 * Referenzprojekte. Eine Datei, ein Eintrag pro Projekt — bewusst als reine Daten,
 * weil jede Zeile in mehreren Ansichten (Liste, Filter, Kennzahlen) gebraucht wird.
 * Neues Projekt = ein Objekt in src/content/referenzen.json ergänzen.
 */
const referenzen = defineCollection({
  loader: file('src/content/referenzen.json', {
    parser: (text) => Object.fromEntries(JSON.parse(text).map((p: any) => [p.slug, p])),
  }),
  schema: z.object({
    slug: z.string(),
    year: z.number().int(),
    client: z.string(),
    scope: z.string(),
    quantity: z.number().optional(),
    unit: z.enum(['cbm', 'qm', 'm²']).optional(),
    category: z.array(z.enum(['schadstoff', 'entkernung', 'demontage', 'beton'])),
    sector: z.string(),
    region: z.string(),
  }),
});

/**
 * Offene Stellen. Eine Markdown-Datei pro Position.
 * Stelle besetzt? Datei löschen — sie verschwindet aus Seite und JobPosting-Markup.
 */
const jobs = defineCollection({
  loader: glob({ base: 'src/content/jobs', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    order: z.number().int(),
    type: z.string(),
    field: z.string(),
    requirements: z.array(z.string()),
  }),
});

export const collections = { referenzen, jobs };
