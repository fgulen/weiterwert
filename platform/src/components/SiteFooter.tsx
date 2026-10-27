import Link from "next/link";
import styles from "./SiteFooter.module.css";

// Pages that are no longer in the header.
const PAGES = [
  { href: "/annahmekriterien", label: "Annahmekriterien" },
  { href: "/geraetepartnerschaft", label: "Gerätepartnerschaft" },
];

// The legal texts live on the main site and cover this one too.
const LEGAL = [
  { href: "https://weiterwert.de/impressum.html", label: "Impressum" },
  { href: "https://weiterwert.de/datenschutz.html", label: "Datenschutzerklärung" },
  { href: "https://weiterwert.de/barrierefreiheit.html", label: "Barrierefreiheit" },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span>© WeiterWert – nicht eingetragener Verein in Gründung</span>
        <nav className={styles.nav} aria-label="Weitere Seiten">
          {PAGES.map((p) => (
            <Link key={p.href} href={p.href}>{p.label}</Link>
          ))}
        </nav>
        <nav className={styles.nav} aria-label="Rechtliches">
          {LEGAL.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
