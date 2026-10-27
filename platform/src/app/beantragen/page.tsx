import type { Metadata } from 'next';
import { getAppEnv } from '@/lib/env';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import { BeantragenForm } from './BeantragenForm';
import styles from './beantragen.module.css';

const TITLE = pageTitle('/beantragen');
export const metadata: Metadata = { title: TITLE };

const MAIL = 'mailto:weiterwert@gmail.com?subject=Ger%C3%A4t%20beantragen';

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
        <section className={styles.interim} aria-labelledby="interim-titel">
          <h2 id="interim-titel">Das Online-Formular folgt in Kürze</h2>
          <p>Bis dahin senden Sie uns Ihre Anfrage einfach per E-Mail. Bitte nennen Sie:</p>
          <ul>
            <li>Ihren Namen bzw. den Namen Ihrer Einrichtung und eine Kontaktperson,</li>
            <li>Ihre Postleitzahl (nur die Region, keine genaue Anschrift),</li>
            <li>die Gerätart (Laptop oder Tablet) und die Anzahl,</li>
            <li>kurz den Verwendungszweck.</li>
          </ul>
          <p>Privatpersonen legen bitte, sofern vorhanden, einen Bescheid bei, auf dem Sie nur Namen und Bewilligungszeitraum lassen. Alle anderen Angaben schwärzen Sie bitte.</p>
          <a className={styles.mailKnopf} href={MAIL}>Anfrage per E-Mail senden</a>
        </section>
      )}
    </>
  );
}
