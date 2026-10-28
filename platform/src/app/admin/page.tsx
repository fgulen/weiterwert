import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FeatureGate } from '@/components/FeatureGate';
import { aktuellerNutzer } from '@/lib/admin/session';
import { ladeSpendenListe } from '@/lib/admin/daten';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { abmelden } from './actions';

const TITLE = pageTitle('/admin');
export const metadata: Metadata = { title: TITLE, robots: { index: false } };

export default async function AdminPage() {
  gatePage('admin');
  const nutzer = await aktuellerNutzer();
  if (!nutzer) redirect('/admin/login');
  const zeilen = await ladeSpendenListe();

  return (
    <>
      <h1>{TITLE}</h1>
      <FeatureGate feature="admin">
        <p>
          Angemeldet als {nutzer.email} ({nutzer.rolle}).
        </p>
        <h2>Gespendete Geräte</h2>
        {zeilen.length === 0 ? (
          <p>Noch keine Einträge.</p>
        ) : (
          <table>
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
                  <td>{z.status}</td>
                  <td>{z.angelegt}</td>
                  <td>{z.geraete.join(', ') || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <form action={abmelden}>
          <button type="submit" className="btn">Abmelden</button>
        </form>
      </FeatureGate>
    </>
  );
}
