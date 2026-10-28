import Link from "next/link";
import { aktuelleSprache } from "@/lib/i18n/server";
import { pfadFuer } from "@/lib/i18n/sprache";
import { UI } from "@/lib/i18n/ui";

export default async function Home() {
  const { lang } = await aktuelleSprache();
  const t = UI[lang];
  return (
    <>
      <h1>{t.homeH1}</h1>
      <p className="lead">{t.homeLead}</p>
      <p><Link className="btn" href={pfadFuer(lang, "/spenden")}>{t.homeCta}</Link></p>
    </>
  );
}
