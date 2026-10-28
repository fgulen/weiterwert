import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeSpendenListe } from '@/lib/admin/daten';
import { geraeteText, statusText } from '@/lib/admin/anzeige';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import Link from 'next/link';
import { abmelden } from './actions';
import styles from './admin.module.css';

const TITLE = pageTitle('/admin');
export const metadata: Metadata = { title: TITLE, robots: { index: false } };

const ROLLE: Record<string, string> = { admin: 'Admin', mitarbeiter: 'Mitarbeiter' };

export default async function AdminPage() {
  gatePage('admin');
  const nutzer = await aktuellerNutzer();
  if (!nutzer) redirect('/admin/login');
  const zeilen = await ladeSpendenListe();

  return (
    <>
      <h1>{TITLE}</h1>
      <FeatureGate feature="admin">
        <p className={styles.meta}>
          Angemeldet als {nutzer.email} ({ROLLE[nutzer.rolle] ?? nutzer.rolle}).
        </p>
        <h2>Gespendete Geräte</h2>
        {zeilen.length === 0 ? (
          <p>Noch keine Einträge.</p>
        ) : (
          <table className={styles.tabelle}>
            <thead>
              <tr>
                <th scope="col">Vorgang</th>
                <th scope="col">Status</th>
                <th scope="col">Datum</th>
                <th scope="col">Geräte</th>
              </tr>
            </thead>
            <tbody>
              {zeilen.map((z) => (
                <tr key={z.vorgangsnummer}>
                  <td>{z.vorgangsnummer}</td>
                  <td>{statusText(z.status)}</td>
                  <td>{z.angelegt}</td>
                  <td>{z.geraete.map(geraeteText).join(', ') || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className={styles.linkzeile}><Link href="/admin/profil">Mein Profil (Passwort, Zwei-Faktor)</Link></p>
        <form action={abmelden}>
          <button type="submit" className="btn">Abmelden</button>
        </form>
      </FeatureGate>
    </>
  );
}
