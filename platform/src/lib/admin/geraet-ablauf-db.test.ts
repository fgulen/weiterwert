import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { beforeEach, describe, expect, it } from 'vitest';

// Prüft die Migrationen in einer echten Postgres-Engine (PGlite), nicht nur die Regeln in TypeScript.
const MIGRATIONEN = [
  '20261024_spendenanfrage.sql',
  '20261113_device_record.sql',
  '20261117_geraet_ablauf.sql',
  '20261119_zweite_freigabe_regel.sql',
];

const DEVICE = '11111111-1111-4111-8111-111111111111';

async function frischeDatenbank(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin;
  `);
  for (const datei of MIGRATIONEN) {
    const sql = readFileSync(join(process.cwd(), 'supabase', 'migrations', datei), 'utf8');
    await db.exec(sql);
  }
  await db.exec(`
    insert into public.contact (id, name, email, plz) values ('22222222-2222-4222-8222-222222222222', 'Test', 'test@example.invalid', '10115');
    insert into public.donation_request (id, vorgangsnummer, idempotency_key, contact_id, regel_version, erklaerung_version, erklaerung_hash)
      values ('33333333-3333-4333-8333-333333333333', 'WW-2026-000001', '44444444-4444-4444-8444-444444444444',
              '22222222-2222-4222-8222-222222222222', 'r1', 'e1', 'h1');
    insert into public.donation_device (id, request_id, position, typ, angaben, ergebnis)
      values ('${DEVICE}', '33333333-3333-4333-8333-333333333333', 1, 'Laptop', '{}', 'ok');
    insert into public.device_record (device_id) values ('${DEVICE}');
  `);
  return db;
}

async function setze(db: PGlite, von: string, nach: string, schritt: string, nutzer: string, zweiter: string | null) {
  return db.query('select public.setze_geraet_status($1, $2, $3, $4, $5, $6)', [DEVICE, von, nach, schritt, nutzer, zweiter]);
}

async function fehler(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return '';
  } catch (e) {
    return (e as Error).message;
  }
}

describe('Migration: Gerät-Ablauf in Postgres', () => {
  let db: PGlite;
  beforeEach(async () => {
    db = await frischeDatenbank();
  });

  it('erlaubter Wechsel setzt Status und schreibt genau ein Ereignis', async () => {
    await setze(db, 'eingegangen', 'zweite_kontrolle', 'zweite_kontrolle', 'anna', null);
    const status = await db.query<{ ablauf_status: string }>('select ablauf_status from public.device_record');
    expect(status.rows[0].ablauf_status).toBe('zweite_kontrolle');
    const ereignisse = await db.query<{ n: number }>('select count(*)::int as n from public.geraet_ereignis');
    expect(ereignisse.rows[0].n).toBe(1);
  });

  it('nicht erlaubter Sprung wird abgelehnt', async () => {
    expect(await fehler(setze(db, 'eingegangen', 'uebergeben', 'x', 'anna', null))).toContain('wechsel_nicht_erlaubt');
  });

  it('veralteter Ausgangsstatus wird abgelehnt', async () => {
    expect(await fehler(setze(db, 'frei', 'reserviert', 'x', 'anna', null))).toContain('status_veraltet');
  });

  it('unbekanntes Gerät wird abgelehnt', async () => {
    const r = db.query('select public.setze_geraet_status($1, $2, $3, $4, $5, $6)', [
      '99999999-9999-4999-8999-999999999999', 'eingegangen', 'zweite_kontrolle', 'x', 'anna', null,
    ]);
    expect(await fehler(r)).toContain('geraet_unbekannt');
  });

  it('Pflichtschritt ohne zweiten Admin wird abgelehnt', async () => {
    await setze(db, 'eingegangen', 'zweite_kontrolle', 'zweite_kontrolle', 'anna', null);
    expect(await fehler(setze(db, 'zweite_kontrolle', 'loeschung_offen', 'loeschung_fehlgeschlagen', 'anna', null))).toContain('zwei_admin_fehlt');
  });

  it('Pflichtschritt mit demselben Admin zweimal wird abgelehnt', async () => {
    await setze(db, 'eingegangen', 'zweite_kontrolle', 'zweite_kontrolle', 'anna', null);
    expect(await fehler(setze(db, 'zweite_kontrolle', 'loeschung_offen', 'loeschung_fehlgeschlagen', 'anna', 'anna'))).toContain('zwei_admin_fehlt');
  });

  it('Pflichtschritt mit zwei verschiedenen Admins geht durch', async () => {
    await setze(db, 'eingegangen', 'zweite_kontrolle', 'zweite_kontrolle', 'anna', null);
    await setze(db, 'zweite_kontrolle', 'loeschung_offen', 'loeschung_fehlgeschlagen', 'anna', 'ben');
    const status = await db.query<{ ablauf_status: string }>('select ablauf_status from public.device_record');
    expect(status.rows[0].ablauf_status).toBe('loeschung_offen');
  });

  it('Ereignisse lassen sich nicht ändern', async () => {
    await setze(db, 'eingegangen', 'zweite_kontrolle', 'zweite_kontrolle', 'anna', null);
    expect(await fehler(db.query("update public.geraet_ereignis set nutzer = 'x'"))).toContain('unveraenderlich');
  });

  it('Ereignisse lassen sich nicht löschen', async () => {
    await setze(db, 'eingegangen', 'zweite_kontrolle', 'zweite_kontrolle', 'anna', null);
    expect(await fehler(db.query('delete from public.geraet_ereignis'))).toContain('unveraenderlich');
  });

  it('anon darf die Funktion nicht aufrufen', async () => {
    await db.exec('set role anon');
    expect(await fehler(setze(db, 'eingegangen', 'zweite_kontrolle', 'zweite_kontrolle', 'anna', null))).toMatch(/permission denied/);
    await db.exec('reset role');
  });
});
