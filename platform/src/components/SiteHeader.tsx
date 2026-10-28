import Link from "next/link";
import styles from "./SiteHeader.module.css";
import { SpracheWahl } from "./SpracheWahl";
import { aktuelleSprache } from "@/lib/i18n/server";
import { SPRACHEN, pfadFuer, type Lang } from "@/lib/i18n/sprache";
import { UI } from "@/lib/i18n/ui";

export async function SiteHeader() {
  const { lang, rest } = await aktuelleSprache();
  const t = UI[lang];
  const nav = [
    { href: "/spenden", label: t.navSpenden, primary: true },
    { href: "/beantragen", label: t.navBeantragen, primary: false },
  ];
  const zielPfade = Object.fromEntries(SPRACHEN.map((l: Lang) => [l, pfadFuer(l, rest)])) as Record<Lang, string>;
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href={pfadFuer(lang, "/")} className={styles.brand}>
          <img src="/logo-mark.svg" alt="" width={48} height={48} />
          <span>Weiter<span className={styles.accent}>Wert</span></span>
        </a>
        <div className={styles.lang}>
          <SpracheWahl lang={lang} zielPfade={zielPfade} label={t.sprachwahl} />
        </div>
        <nav aria-label="Hauptmenü" className={styles.nav}>
          {nav.map((n) => (
            <Link key={n.href} href={pfadFuer(lang, n.href)} className={n.primary ? styles.primary : styles.secondary}>{n.label}</Link>
          ))}
          <Link href="/admin/login" className={styles.login}>{t.teamAnmeldung}</Link>
        </nav>
      </div>
    </header>
  );
}
