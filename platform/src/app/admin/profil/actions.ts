'use server';

import { cookies } from 'next/headers';
import { SITZUNG_COOKIE, aktuellerNutzer } from '@/lib/admin/session';
import { entferneFaktor, ladeKonto, pruefeCode, pruefePasswort, setzePasswort, starteEinrichtung } from '@/lib/admin/konto';
import { FEHLER_TEXT, normalisiereCode, pruefePasswortWechsel, sicheresQr } from '@/lib/admin/profil';

export type Ergebnis = {
  ok?: string;
  fehler?: string;
  einrichtung?: { faktorId: string; qr: string | null; secret: string };
};

const ALLGEMEIN = 'Das hat nicht geklappt. Bitte Eingaben prüfen und erneut versuchen.';
const ABGELAUFEN = 'Bitte erneut anmelden.';

/** Every action verifies the session with Supabase again (token + role); nothing is trusted from the browser. */
async function sitzung(): Promise<{ token: string; email: string } | null> {
  const nutzer = await aktuellerNutzer(); // null in the test environment, too
  if (!nutzer) return null;
  const token = (await cookies()).get(SITZUNG_COOKIE)?.value;
  return token ? { token, email: nutzer.email } : null;
}

async function neuesToken(token: string, laufzeit: number): Promise<void> {
  (await cookies()).set(SITZUNG_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: laufzeit,
  });
}

export async function passwortAendern(_v: Ergebnis, fd: FormData): Promise<Ergebnis> {
  const s = await sitzung();
  if (!s) return { fehler: ABGELAUFEN };
  const aktuell = String(fd.get('aktuell') ?? '');
  const neu = String(fd.get('neu') ?? '');
  const wdh = String(fd.get('wiederholung') ?? '');
  const f = pruefePasswortWechsel(aktuell, neu, wdh);
  if (f) return { fehler: FEHLER_TEXT[f] };

  // Re-verify the current password. The generic message does not say which part failed.
  const frisch = await pruefePasswort(s.email, aktuell);
  if (!frisch) return { fehler: ALLGEMEIN };

  // With an enrolled factor Supabase needs aal2 to change the password: require a fresh code.
  const konto = await ladeKonto(frisch);
  const verifiziert = konto?.faktoren.find((x) => x.status === 'verified');
  let token = frisch;
  let laufzeit = 3600;
  if (verifiziert) {
    const code = normalisiereCode(String(fd.get('code') ?? ''));
    if (!code) return { fehler: FEHLER_TEXT.code };
    const p = await pruefeCode(frisch, verifiziert.id, code);
    if (!p) return { fehler: ALLGEMEIN };
    token = p.token;
    laufzeit = p.laufzeit;
  }
  if (!(await setzePasswort(token, neu))) return { fehler: ALLGEMEIN };
  await neuesToken(token, laufzeit);
  return { ok: 'Das Passwort wurde geändert.' };
}

export async function mfaStarten(): Promise<Ergebnis> {
  const s = await sitzung();
  if (!s) return { fehler: ABGELAUFEN };
  const konto = await ladeKonto(s.token);
  if (konto?.faktoren.some((x) => x.status === 'verified')) return { fehler: 'Die Zwei-Faktor-Anmeldung ist schon eingerichtet.' };
  // Remove abandoned, unverified factors so a new enrollment is possible.
  for (const f of konto?.faktoren.filter((x) => x.status === 'unverified') ?? []) await entferneFaktor(s.token, f.id);
  const e = await starteEinrichtung(s.token, `Authenticator ${new Date().toISOString().slice(0, 10)}`);
  if (!e) return { fehler: ALLGEMEIN };
  return { einrichtung: { faktorId: e.faktorId, qr: sicheresQr(e.qr), secret: e.secret } };
}

export async function mfaBestaetigen(_v: Ergebnis, fd: FormData): Promise<Ergebnis> {
  const s = await sitzung();
  if (!s) return { fehler: ABGELAUFEN };
  const faktorId = String(fd.get('faktor') ?? '');
  const code = normalisiereCode(String(fd.get('code') ?? ''));
  if (!code) return { fehler: FEHLER_TEXT.code };
  // The factor must be one of this user's own unverified factors.
  const konto = await ladeKonto(s.token);
  if (!konto?.faktoren.some((x) => x.id === faktorId && x.status === 'unverified')) return { fehler: ALLGEMEIN };
  const p = await pruefeCode(s.token, faktorId, code);
  if (!p) return { fehler: FEHLER_TEXT.code };
  await neuesToken(p.token, p.laufzeit);
  return { ok: 'Die Zwei-Faktor-Anmeldung ist eingerichtet.' };
}

export async function mfaEntfernen(_v: Ergebnis, fd: FormData): Promise<Ergebnis> {
  const s = await sitzung();
  if (!s) return { fehler: ABGELAUFEN };
  const faktorId = String(fd.get('faktor') ?? '');
  const code = normalisiereCode(String(fd.get('code') ?? ''));
  if (!code) return { fehler: FEHLER_TEXT.code };
  const konto = await ladeKonto(s.token);
  if (!konto?.faktoren.some((x) => x.id === faktorId && x.status === 'verified')) return { fehler: ALLGEMEIN };
  const p = await pruefeCode(s.token, faktorId, code); // fresh code gives an aal2 token
  if (!p) return { fehler: FEHLER_TEXT.code };
  if (!(await entferneFaktor(p.token, faktorId))) return { fehler: ALLGEMEIN };
  await neuesToken(p.token, p.laufzeit);
  return { ok: 'Die Zwei-Faktor-Anmeldung wurde entfernt.' };
}
