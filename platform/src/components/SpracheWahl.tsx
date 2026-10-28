'use client';

import { SPRACHEN, type Lang } from '@/lib/i18n/sprache';
import styles from './SpracheWahl.module.css';

const NAMEN: Record<Lang, string> = { de: 'DE', tr: 'TR', en: 'EN' };

/** Language select. Choosing a language loads the same page in that language (full load, so the server renders it). */
export function SpracheWahl({ lang, zielPfade, label }: { lang: Lang; zielPfade: Record<Lang, string>; label: string }) {
  return (
    <select
      className={styles.select}
      aria-label={label}
      value={lang}
      onChange={(e) => { window.location.assign(zielPfade[e.target.value as Lang]); }}
    >
      {SPRACHEN.map((l) => (
        <option key={l} value={l}>{NAMEN[l]}</option>
      ))}
    </select>
  );
}
