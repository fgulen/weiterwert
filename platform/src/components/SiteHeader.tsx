import Link from "next/link";
import styles from "./SiteHeader.module.css";

/** The logo always leads to the main homepage, which is the single entry point. */
export const LOGO_HREF = "https://weiterwert.de/";

// Only the two main actions, styled like the homepage buttons. Further pages live in the footer.
const NAV = [
  { href: "/spenden", label: "Gerät spenden", primary: true },
  { href: "/beantragen", label: "Gerät beantragen", primary: false },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href={LOGO_HREF} className={styles.brand}>
          <img src="/logo-mark.svg" alt="" width={48} height={48} />
          <span>Weiter<span className={styles.accent}>Wert</span></span>
        </a>
        <nav aria-label="Hauptmenü" className={styles.nav}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={n.primary ? styles.primary : styles.secondary}>{n.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
