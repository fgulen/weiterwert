import { SEITEN } from '@/lib/i18n/seiten';
import type { Lang } from '@/lib/i18n/sprache';
import styles from './StatusBadge.module.css';

export function StatusBadge({ kind, lang = 'de' }: { kind: 'demnaechst' | 'entwurf'; lang?: Lang }) {
  const t = SEITEN[lang];
  return kind === 'demnaechst'
    ? <span className={`${styles.badge} ${styles.soon}`}>{t.badgeSoon}</span>
    : <span className={`${styles.badge} ${styles.draft}`}>{t.badgeDraft}</span>;
}
