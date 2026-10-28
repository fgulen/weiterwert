import { aktuelleSprache } from "@/lib/i18n/server";
import { UI } from "@/lib/i18n/ui";
import { SITEMAP } from "@/lib/sitemap";

/** Shown under the header on Turkish and English pages that are still German only (legal pages, staff area). */
export async function NurDeutschHinweis() {
  const { lang, rest } = await aktuelleSprache();
  if (lang === "de") return null;
  const nurDeutsch = SITEMAP.some((s) => s.germanOnly && (rest === s.path || rest.startsWith(`${s.path}/`)));
  if (!nurDeutsch) return null;
  return (
    <p role="note" style={{ margin: 0, padding: "8px 16px", textAlign: "center", fontSize: "0.92rem", background: "var(--surface-alt)", color: "var(--ink)" }}>
      {UI[lang].nurDeutsch}
    </p>
  );
}
