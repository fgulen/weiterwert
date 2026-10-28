import { aktuelleSprache } from '@/lib/i18n/server';
import { homeHtml } from './homeHtml';
import { IntroInit } from './IntroInit';

// Homepage body (the sections of index.html). The header and footer come from the layout.
export async function Startseite() {
  const { lang } = await aktuelleSprache();
  return (
    <>
      <div className="home" dangerouslySetInnerHTML={{ __html: homeHtml(lang) }} />
      <IntroInit />
    </>
  );
}
