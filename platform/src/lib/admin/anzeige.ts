import { adminTexte, mit } from '@/lib/i18n/admin';
import type { Lang } from '@/lib/i18n/sprache';

// Colour class per status (see admin.module.css). Text stays the main signal, colour only supports it.
const STATUS_KLASSE: Record<string, string> = {
  neu: 'neu',
  geprueft: 'geprueft',
  zugeordnet: 'zugeordnet',
  uebergeben: 'uebergeben',
  abgeschlossen: 'abgeschlossen',
};

export function statusText(status: string, lang: Lang = 'de'): string {
  const s = adminTexte(lang).status as Record<string, string>;
  return s[status] ?? status;
}

export function statusKlasse(status: string): string {
  return STATUS_KLASSE[status] ?? 'neu';
}

export function geraeteText(typ: string, lang: Lang = 'de'): string {
  const g = adminTexte(lang).geraete as Record<string, string>;
  return g[typ] ?? typ;
}

/** Brand and model when the donor gave them, otherwise the device type. */
export function geraeteName(g: { typ: string; marke?: string | null; modell?: string | null }, lang: Lang = 'de'): string {
  return [g.marke, g.modell].filter(Boolean).join(' ') || geraeteText(g.typ, lang);
}

const BERLIN = { timeZone: 'Europe/Berlin' } as const;

/** 13.11.2026 (the same in every language) */
export function datumDe(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString('de-DE', { ...BERLIN, day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** 13.11.2026, 11:54 */
export function datumZeitDe(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16).replace('T', ' ');
  return d.toLocaleString('de-DE', { ...BERLIN, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export { mit };

import { CHECK } from '@/lib/i18n/check';

/**
 * Reasons are stored as the German sentence. Show the same reason in the other language when the sentence is known;
 * unknown sentences stay as they were stored.
 */
export function grundText(text: string, lang: Lang): string {
  if (lang === 'de') return text;
  const de = CHECK.de.gruende as Record<string, string>;
  const code = Object.keys(de).find((k) => de[k] === text);
  if (!code) return text;
  return (CHECK[lang].gruende as Record<string, string>)[code] ?? text;
}
