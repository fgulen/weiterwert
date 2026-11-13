import { getAppEnv } from '@/lib/env';

/**
 * Only for `next dev` with APP_ENV=test. Requests and their cleaned photos are kept in server memory,
 * so the admin pages can show, edit and delete what was sent while the dev server runs.
 * Lost on restart. Never active in a production build or on Vercel.
 */
export function devVorschauAktiv(): boolean {
  return process.env.NODE_ENV === 'development' && getAppEnv() === 'test';
}

export type DevFoto = { id: string; typ: 'jpeg' | 'png'; daten: Uint8Array; angelegt: string };

export type DevEintrag = {
  vorgangsnummer: string;
  angelegt: string;
  payload: Record<string, unknown>;
  fotos: DevFoto[];
};

const halter = globalThis as unknown as { __wwDevVorschau?: Map<string, DevEintrag> };
function speicher(): Map<string, DevEintrag> {
  halter.__wwDevVorschau ??= new Map();
  return halter.__wwDevVorschau;
}

/** Entries from an older dev build may still be in memory (photo count instead of a list). Repair them on read. */
function repariere(e: DevEintrag): DevEintrag {
  if (!Array.isArray(e.fotos)) e.fotos = [];
  return e;
}

function nachKey(key: string): DevEintrag | undefined {
  const k = key.toLowerCase();
  for (const e of speicher().values()) {
    if (String(e.payload.idempotency_key ?? '').toLowerCase() === k) return repariere(e);
  }
  return undefined;
}

export function devSpeichere(vorgangsnummer: string, payload: Record<string, unknown>): void {
  if (!devVorschauAktiv()) return;
  speicher().set(vorgangsnummer, { vorgangsnummer, angelegt: new Date().toISOString(), payload, fotos: [] });
}

/** Adds cleaned photos to the request with this idempotency key (the key the donor's browser holds). */
export function devFotosHinzu(idempotencyKey: string, bilder: Array<{ typ: 'jpeg' | 'png'; daten: Uint8Array }>): void {
  if (!devVorschauAktiv()) return;
  const e = nachKey(idempotencyKey);
  if (!e) return;
  const jetzt = new Date().toISOString();
  for (const b of bilder) e.fotos.push({ id: crypto.randomUUID(), typ: b.typ, daten: b.daten, angelegt: jetzt });
}

/** Newest first. Empty outside the dev preview. */
export function devEintraege(): DevEintrag[] {
  if (!devVorschauAktiv()) return [];
  return [...speicher().values()].map(repariere).sort((a, b) => b.angelegt.localeCompare(a.angelegt));
}

export function devEintrag(vorgangsnummer: string): DevEintrag | null {
  if (!devVorschauAktiv()) return null;
  const e = speicher().get(vorgangsnummer);
  return e ? repariere(e) : null;
}

export function devFoto(vorgangsnummer: string, fotoId: string): DevFoto | null {
  return devEintrag(vorgangsnummer)?.fotos.find((f) => f.id === fotoId) ?? null;
}

export function devFotoLoeschen(vorgangsnummer: string, fotoId: string): boolean {
  const e = devEintrag(vorgangsnummer);
  if (!e) return false;
  const n = e.fotos.length;
  e.fotos = e.fotos.filter((f) => f.id !== fotoId);
  return e.fotos.length < n;
}

export function devKontaktAendern(vorgangsnummer: string, kontakt: Record<string, string>): boolean {
  const e = devEintrag(vorgangsnummer);
  if (!e) return false;
  e.payload.kontakt = { ...(e.payload.kontakt as Record<string, string>), ...kontakt };
  return true;
}

export function devEntfernen(vorgangsnummer: string): boolean {
  if (!devVorschauAktiv()) return false;
  return speicher().delete(vorgangsnummer);
}

/** Stores the device record of one device (position starts at 1). */
export function devAkteSetzen(vorgangsnummer: string, position: number, akte: Record<string, unknown>): boolean {
  const e = devEintrag(vorgangsnummer);
  if (!e) return false;
  const geraete = (e.payload.geraete as Array<Record<string, unknown>> | undefined) ?? [];
  const g = geraete[position - 1];
  if (!g) return false;
  g.akte = akte;
  return true;
}
