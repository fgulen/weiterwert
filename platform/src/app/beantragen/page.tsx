import type { Metadata } from 'next';
import { getAppEnv } from '@/lib/env';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { BeantragenForm } from './BeantragenForm';
import styles from './beantragen.module.css';

const TITLE = pageTitle('/beantragen');
export const metadata: Metadata = { title: TITLE };

export default function BeantragenPage() {
  gatePage('geraetBeantragen');
  // Until the flag is switched to "aktiv" (plan §7), the form is only shown in the test environment.
  const formOffen = getAppEnv() === 'test';
  return (
    <>
      <h1>{TITLE}</h1>
      <p className="lead">
        Für Schulen, Einrichtungen und Privatpersonen mit Bedarf. Wir können nicht jede Anfrage erfüllen; wir melden uns mit dem Stand Ihrer Anfrage.
      </p>
      {formOffen ? (
        <BeantragenForm />
      ) : (
        <p className={styles.hinweis}>Dieses Formular ist demnächst verfügbar. Bis dahin schreiben Sie uns an <a href="mailto:weiterwert@gmail.com">weiterwert@gmail.com</a>.</p>
      )}
    </>
  );
}
