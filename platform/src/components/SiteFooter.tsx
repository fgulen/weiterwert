import Link from "next/link";
import styles from "./SiteFooter.module.css";
import { aktuelleSprache } from "@/lib/i18n/server";
import { pfadFuer } from "@/lib/i18n/sprache";
import { UI } from "@/lib/i18n/ui";

export async function SiteFooter() {
  const { lang } = await aktuelleSprache();
  const t = UI[lang];
  // Legal texts are German and live on the main site.
  const PAGES = [
    { href: "/annahmekriterien", label: t.annahme },
    { href: "/geraetepartnerschaft", label: t.partner },
  ];
  const LEGAL = [
    { href: "https://weiterwert.de/impressum.html", label: t.impressum },
    { href: "https://weiterwert.de/datenschutz.html", label: t.datenschutz },
    { href: "https://weiterwert.de/barrierefreiheit.html", label: t.barrierefrei },
  ];
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span>{t.copyright}</span>
        <nav className={styles.nav} aria-label={t.weitere}>
          {PAGES.map((p) => (
            <Link key={p.href} href={pfadFuer(lang, p.href)}>{p.label}</Link>
          ))}
        </nav>
        <nav className={styles.nav} aria-label={t.rechtliches}>
          {LEGAL.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
