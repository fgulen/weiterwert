import { aktuelleSprache } from "@/lib/i18n/server";
import { UI } from "@/lib/i18n/ui";

/** Shown under the header on Turkish and English pages: the content is German for now. */
export async function NurDeutschHinweis() {
  const { lang } = await aktuelleSprache();
  if (lang === "de") return null;
  return (
    <p role="note" style={{ margin: 0, padding: "8px 16px", textAlign: "center", fontSize: "0.92rem", background: "var(--surface-alt)", color: "var(--ink)" }}>
      {UI[lang].nurDeutsch}
    </p>
  );
}
