'use server';

import { cookies } from 'next/headers';
import { SITZUNG_COOKIE, aktuellerNutzer } from '@/lib/admin/session';
import { entferneFaktor, ladeKonto, pruefeCode, pruefePasswort, setzePasswort, starteEinrichtung } from '@/lib/admin/konto';
import { normalisiereCode, pruefePasswortWechsel, PASSWORT_MAX, PASSWORT_MIN, sicheresQr, type PruefFehler } from '@/lib/admin/profil';
import { aktuelleSprache } from '@/lib/i18n/server';
import { adminTexte, mit } from '@/lib/i18n/admin';

export type Ergebnis = {
  ok?: string;
  fehler?: string;
  einrichtung?: { faktorId: string; qr: string | null; secret: string };
};

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
    path: '/',
    maxAge: laufzeit,
  });
}

function pwFehlerText(f: PruefFehler, lang: Parameters<typeof adminTexte>[0]): string {
  const t = adminTexte(lang);
  const n = f === 'zu-lang' ? PASSWORT_MAX : PASSWORT_MIN;
  return mit(t.konto.pwFehler[f], { n });
}

export async function passwortAendern(_v: Ergebnis, fd: FormData): Promise<Ergebnis> {
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const s = await sitzung();
  if (!s) return { fehler: t.konto.abgelaufen };
  const aktuell = String(fd.get('aktuell') ?? '');
  const neu = String(fd.get('neu') ?? '');
  const wdh = String(fd.get('wiederholung') ?? '');
  const f = pruefePasswortWechsel(aktuell, neu, wdh);
  if (f) return { fehler: pwFehlerText(f, lang) };

  // Re-verify the current password. The generic message does not say which part failed.
  const frisch = await pruefePasswort(s.email, aktuell);
  if (!frisch) return { fehler: t.fehlerAllgemein };

  // With an enrolled factor Supabase needs aal2 to change the password: require a fresh code.
  const konto = await ladeKonto(frisch);
  const verifiziert = konto?.faktoren.find((x) => x.status === 'verified');
  let token = frisch;
  let laufzeit = 3600;
  if (verifiziert) {
    const code = normalisiereCode(String(fd.get('code') ?? ''));
    if (!code) return { fehler: pwFehlerText('code', lang) };
    const p = await pruefeCode(frisch, verifiziert.id, code);
    if (!p) return { fehler: t.fehlerAllgemein };
    token = p.token;
    laufzeit = p.laufzeit;
  }
  if (!(await setzePasswort(token, neu))) return { fehler: t.fehlerAllgemein };
  await neuesToken(token, laufzeit);
  return { ok: t.konto.pwGeaendert };
}

export async function mfaStarten(): Promise<Ergebnis> {
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const s = await sitzung();
  if (!s) return { fehler: t.konto.abgelaufen };
  const konto = await ladeKonto(s.token);
  if (konto?.faktoren.some((x) => x.status === 'verified')) return { fehler: t.konto.mfaSchonEingerichtet };
  // Remove abandoned, unverified factors so a new enrollment is possible.
  for (const f of konto?.faktoren.filter((x) => x.status === 'unverified') ?? []) await entferneFaktor(s.token, f.id);
  const e = await starteEinrichtung(s.token, `Authenticator ${new Date().toISOString().slice(0, 10)}`);
  if (!e) return { fehler: t.fehlerAllgemein };
  return { einrichtung: { faktorId: e.faktorId, qr: sicheresQr(e.qr), secret: e.secret } };
}

export async function mfaBestaetigen(_v: Ergebnis, fd: FormData): Promise<Ergebnis> {
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const s = await sitzung();
  if (!s) return { fehler: t.konto.abgelaufen };
  const faktorId = String(fd.get('faktor') ?? '');
  const code = normalisiereCode(String(fd.get('code') ?? ''));
  if (!code) return { fehler: pwFehlerText('code', lang) };
  // The factor must be one of this user's own unverified factors.
  const konto = await ladeKonto(s.token);
  if (!konto?.faktoren.some((x) => x.id === faktorId && x.status === 'unverified')) return { fehler: t.fehlerAllgemein };
  const p = await pruefeCode(s.token, faktorId, code);
  if (!p) return { fehler: pwFehlerText('code', lang) };
  await neuesToken(p.token, p.laufzeit);
  return { ok: t.konto.mfaEingerichtetOk };
}

export async function mfaEntfernen(_v: Ergebnis, fd: FormData): Promise<Ergebnis> {
  const { lang } = await aktuelleSprache();
  const t = adminTexte(lang);
  const s = await sitzung();
  if (!s) return { fehler: t.konto.abgelaufen };
  const faktorId = String(fd.get('faktor') ?? '');
  const code = normalisiereCode(String(fd.get('code') ?? ''));
  if (!code) return { fehler: pwFehlerText('code', lang) };
  const konto = await ladeKonto(s.token);
  if (!konto?.faktoren.some((x) => x.id === faktorId && x.status === 'verified')) return { fehler: t.fehlerAllgemein };
  const p = await pruefeCode(s.token, faktorId, code); // fresh code gives an aal2 token
  if (!p) return { fehler: pwFehlerText('code', lang) };
  if (!(await entferneFaktor(p.token, faktorId))) return { fehler: t.fehlerAllgemein };
  await neuesToken(p.token, p.laufzeit);
  return { ok: t.konto.mfaEntferntOk };
}
