import { HOME } from '@/lib/i18n/home';
import { pfadFuer, type Lang } from '@/lib/i18n/sprache';

// Port of the homepage sections of index.html (from <section class="hero"> to the end of <main>).
// Header, footer and script are not included. Texts come from HOME; ids, classes and inline styles are unchanged.
// data-i18n attributes are removed; their text is filled in per language.

function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function homeHtml(lang: Lang): string {
  const H = HOME[lang];
  return `  <section class="hero">
    <div class="container hero-inner">
      <span class="eyebrow">${esc(H.heroEyebrow)}</span>
      <h1>${esc(H.heroH1)}</h1>
      <p class="lead">${esc(H.heroLead)}</p>
      <div class="hero-actions">
        <a href="${pfadFuer(lang, '/spenden')}" class="btn btn-primary btn-lg">${esc(H.heroCtaPrimary)}</a>
        <a href="${pfadFuer(lang, '/beantragen')}" class="btn btn-ghost btn-lg">${esc(H.heroCtaSecondary)}</a>
      </div>
    </div>

    <div class="container">
      <figure class="hero-art">
        <svg viewBox="0 0 760 260" role="img" aria-labelledby="heroArtTitle" xmlns="http://www.w3.org/2000/svg">
          <title id="heroArtTitle">${esc(H.heroArtTitle)}</title>
          <g class="art-stroke" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- box: collect -->
            <path d="M60 150 L60 210 L150 210 L150 150 Z"/>
            <path d="M60 150 L105 125 L150 150"/>
            <path d="M105 125 L105 210" stroke-dasharray="4 5"/>
            <text class="art-label" x="70" y="240" font-family="Inter, sans-serif" font-size="13">${esc(H.svgLabel1)}</text>

            <!-- arrow -->
            <path class="art-accent" d="M175 175 L235 175"/>
            <path class="art-accent" d="M225 167 L235 175 L225 183"/>

            <!-- laptop with wrench: repair -->
            <path d="M280 190 L280 140 L360 140 L360 190 Z"/>
            <path d="M270 190 L370 190 L365 202 L275 202 Z"/>
            <g class="art-green" transform="translate(330,120) rotate(45)">
              <rect x="-4" y="-22" width="8" height="26" rx="3"/>
              <circle cx="0" cy="4" r="9"/>
            </g>
            <text class="art-label" x="285" y="222" font-family="Inter, sans-serif" font-size="13">${esc(H.svgLabel2)}</text>

            <!-- arrow -->
            <path class="art-accent" d="M395 175 L455 175"/>
            <path class="art-accent" d="M445 167 L455 175 L445 183"/>

            <!-- laptop with gear: install software -->
            <path d="M500 190 L500 140 L580 140 L580 190 Z"/>
            <path d="M490 190 L590 190 L585 202 L495 202 Z"/>
            <circle class="art-green" cx="540" cy="163" r="14"/>
            <circle class="art-green" cx="540" cy="163" r="4"/>
            <text class="art-label" x="497" y="222" font-family="Inter, sans-serif" font-size="13">${esc(H.svgLabel3)}</text>

            <!-- arrow -->
            <path class="art-accent" d="M615 175 L660 175"/>
            <path class="art-accent" d="M650 167 L660 175 L650 183"/>

            <!-- hand receiving device: deliver -->
            <path d="M672 195 C672 160 700 150 700 150 L700 130 L706 130 L706 150 C706 150 730 158 730 195 Z"/>
            <circle cx="700" cy="118" r="7"/>
            <text class="art-label" x="662" y="222" font-family="Inter, sans-serif" font-size="13">${esc(H.svgLabel4)}</text>
          </g>
        </svg>
        <figcaption>${esc(H.heroFigcaption)}</figcaption>
      </figure>
      <!-- Hero-Animation (ersetzt die Zeichnung ab 760 px ohne Reduced Motion) -->
      <div class="ia-wrap">
        <div class="ia-frame" id="iaFrame">
          <div class="ia-stage" id="iaStage" aria-hidden="true">

            <!-- Szene 1: Weg, 0–5 s -->
            <div class="ia-scene" style="--start:0s;--len:5s">
              <div class="ia-node ia-pop" style="--d:.3s;left:360px;top:440px"><svg viewBox="0 0 24 24" width="78" height="78" fill="none" stroke="#064E67" stroke-width="1.4" stroke-linejoin="round"><path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg></div>
              <div class="ia-arrow ia-draw" style="--d:.9s;left:520px;top:440px;width:200px"></div>
              <div class="ia-node ia-g ia-pop" style="--d:1.2s;left:760px;top:440px"><svg viewBox="0 0 24 24" width="78" height="78" fill="none" stroke="#1E7451" stroke-width="1.4" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.1-3.1a4 4 0 01-5.4 5.4L6 21l-3-3 9.6-9.6a4 4 0 015.4-5.4l-3.1 3.1z"/></svg></div>
              <div class="ia-arrow ia-draw" style="--d:1.8s;left:920px;top:440px;width:200px"></div>
              <div class="ia-node ia-l ia-pop" style="--d:2.1s;left:1160px;top:440px"><svg viewBox="0 0 24 24" width="78" height="78" fill="none" stroke="#52973C" stroke-width="1.4" stroke-linejoin="round"><rect x="4" y="4" width="16" height="12" rx="1.5"/><path d="M2 20h20"/><path d="M9 8h6M9 11h4"/></svg></div>
              <div class="ia-arrow ia-draw" style="--d:2.7s;left:1320px;top:440px;width:200px"></div>
              <div class="ia-node ia-s ia-pop" style="--d:3s;left:1560px;top:440px"><svg viewBox="0 0 24 24" width="78" height="78" fill="none" stroke="#B07F00" stroke-width="1.4" stroke-linejoin="round"><path d="M3 11l18-7-7 18-2-8-8-2z"/></svg></div>
              <div class="ia-label ia-in" style="--d:.5s;left:360px;top:540px">${esc(H.svgLabel1)}</div>
              <div class="ia-label ia-in" style="--d:1.4s;left:760px;top:540px">${esc(H.svgLabel2)}</div>
              <div class="ia-label ia-in" style="--d:2.3s;left:1160px;top:540px">${esc(H.svgLabel3)}</div>
              <div class="ia-label ia-in" style="--d:3.2s;left:1560px;top:540px">${esc(H.svgLabel4)}</div>
            </div>

            <!-- Szene 2: vier Wege, 5–10 s -->
            <div class="ia-scene" style="--start:5s;--len:5s">
              <p class="ia-h2 ia-in" style="--d:5.1s;top:150px">${esc(H.pathsH2)}</p>
              <div class="ia-card ia-in" style="--d:5.6s;left:200px"><div class="ia-tag">${esc(H.path1Label)}</div><div class="ia-name">${esc(H.path1Title)}</div></div>
              <div class="ia-card ia-in" style="--d:6.1s;left:620px"><div class="ia-tag">${esc(H.path2Label)}</div><div class="ia-name">${esc(H.path2Title)}</div></div>
              <div class="ia-card ia-in" style="--d:6.6s;left:1040px"><div class="ia-tag">${esc(H.path3Label)}</div><div class="ia-name">${esc(H.path3Title)}</div></div>
              <div class="ia-card ia-in" style="--d:7.1s;left:1460px"><div class="ia-tag">${esc(H.path4Label)}</div><div class="ia-name">${esc(H.path4Title)}</div></div>
            </div>

            <!-- Szene 3: fünf Schritte, 10–15 s -->
            <div class="ia-scene" style="--start:10s;--len:5s">
              <div class="ia-eyebrow ia-in" style="--d:10.1s;top:150px">${esc(H.howEyebrow)}</div>
              <p class="ia-h2 ia-in" style="--d:10.3s;top:200px">${esc(H.howH2)}</p>
              <div class="ia-rail ia-draw" style="--d:11s;left:330px;width:1260px"></div>
              <div class="ia-step" style="left:330px"><div class="ia-num ia-pop" style="--d:10.9s">1</div><div class="ia-stepname ia-in" style="--d:11.1s">${esc(H.step1Title)}</div></div>
              <div class="ia-step" style="left:600px"><div class="ia-num ia-pop" style="--d:11.3s">2</div><div class="ia-stepname ia-in" style="--d:11.5s">${esc(H.step2Title)}</div></div>
              <div class="ia-step" style="left:870px"><div class="ia-num ia-pop" style="--d:11.7s">3</div><div class="ia-stepname ia-in" style="--d:11.9s">${esc(H.step3Title)}</div></div>
              <div class="ia-step" style="left:1140px"><div class="ia-num ia-pop" style="--d:12.1s">4</div><div class="ia-stepname ia-in" style="--d:12.3s">${esc(H.step4Title)}</div></div>
              <div class="ia-step" style="left:1410px"><div class="ia-num ia-pop" style="--d:12.5s">5</div><div class="ia-stepname ia-in" style="--d:12.7s">${esc(H.step5Title)}</div></div>
              <p class="ia-body ia-in" style="--d:13.2s;top:820px">${esc(H.howP)}</p>
            </div>

            <!-- Szene 4: Vertrauen, 15–19 s -->
            <div class="ia-scene" style="--start:15s;--len:4s">
              <svg class="ia-shield ia-pop" style="--d:15.2s" viewBox="0 0 24 24" fill="none" stroke="#1E7451" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>
              <p class="ia-h2 ia-in" style="--d:15.6s;left:900px;width:900px;top:250px;text-align:left;font-size:64px">${esc(H.trustH2)}</p>
            </div>

            <!-- Szene 5: Ansatz & CTA, 19–24 s -->
            <div class="ia-scene ia-last" style="--start:19s;--len:5s">
              <img class="ia-logo ia-pop" style="--d:19.2s" src="/logo-mark.svg" alt="" width="220" height="220">
              <p class="ia-h2 ia-in" style="--d:19.6s;top:430px">${esc(H.approachH2)}</p>
              <div class="ia-ctawrap ia-in" style="--d:20.8s"><span class="ia-cta-text">${esc(H.heroCtaPrimary)}</span></div>
              <div class="ia-url ia-in" style="--d:21.8s">spenden.weiterwert.de/spenden</div>
            </div>

          </div>
        </div>
        <div class="ia-controls">
          <button type="button" id="iaToggle" aria-pressed="false"><span class="ia-on-pause">${esc(H.introPause)}</span><span class="ia-on-play" hidden>${esc(H.introPlay)}</span><span class="ia-on-replay" hidden>${esc(H.introReplay)}</span></button>
        </div>
      </div>
      <!-- Hochformat-Hero-Animation für schmale Bildschirme (unter 760 px, ohne Reduced Motion) -->
      <div class="ia-wrap-v">
        <div class="ia-frame" id="iaFrameV">
          <div class="ia-stage ia-stage-v" id="iaStageV" aria-hidden="true">

            <!-- Szene 1: Weg, 0–5 s -->
            <div class="ia-scene" style="--start:0s;--len:5s">
              <div class="ia-node ia-pop" style="--d:.3s;left:300px;top:520px"><svg viewBox="0 0 24 24" width="78" height="78" fill="none" stroke="#064E67" stroke-width="1.4" stroke-linejoin="round"><path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg></div>
              <div class="ia-arrow ia-arrow-v ia-draw-v" style="--d:.9s;top:595px"></div>
              <div class="ia-node ia-g ia-pop" style="--d:1.2s;left:300px;top:820px"><svg viewBox="0 0 24 24" width="78" height="78" fill="none" stroke="#1E7451" stroke-width="1.4" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.1-3.1a4 4 0 01-5.4 5.4L6 21l-3-3 9.6-9.6a4 4 0 015.4-5.4l-3.1 3.1z"/></svg></div>
              <div class="ia-arrow ia-arrow-v ia-draw-v" style="--d:1.8s;top:895px"></div>
              <div class="ia-node ia-l ia-pop" style="--d:2.1s;left:300px;top:1120px"><svg viewBox="0 0 24 24" width="78" height="78" fill="none" stroke="#52973C" stroke-width="1.4" stroke-linejoin="round"><rect x="4" y="4" width="16" height="12" rx="1.5"/><path d="M2 20h20"/><path d="M9 8h6M9 11h4"/></svg></div>
              <div class="ia-arrow ia-arrow-v ia-draw-v" style="--d:2.7s;top:1195px"></div>
              <div class="ia-node ia-s ia-pop" style="--d:3s;left:300px;top:1420px"><svg viewBox="0 0 24 24" width="78" height="78" fill="none" stroke="#B07F00" stroke-width="1.4" stroke-linejoin="round"><path d="M3 11l18-7-7 18-2-8-8-2z"/></svg></div>
              <div class="ia-label ia-in" style="--d:.5s;left:470px;top:485px">${esc(H.svgLabel1)}</div>
              <div class="ia-label ia-in" style="--d:1.4s;left:470px;top:785px">${esc(H.svgLabel2)}</div>
              <div class="ia-label ia-in" style="--d:2.3s;left:470px;top:1085px">${esc(H.svgLabel3)}</div>
              <div class="ia-label ia-in" style="--d:3.2s;left:470px;top:1385px">${esc(H.svgLabel4)}</div>
            </div>

            <!-- Szene 2: vier Wege, 5–10 s -->
            <div class="ia-scene" style="--start:5s;--len:5s">
              <p class="ia-h2 ia-in" style="--d:5.1s;top:150px">${esc(H.pathsH2)}</p>
              <div class="ia-card ia-in" style="--d:5.6s;left:60px;top:520px"><div class="ia-tag">${esc(H.path1Label)}</div><div class="ia-name">${esc(H.path1Title)}</div></div>
              <div class="ia-card ia-in" style="--d:6.1s;left:60px;top:860px"><div class="ia-tag">${esc(H.path2Label)}</div><div class="ia-name">${esc(H.path2Title)}</div></div>
              <div class="ia-card ia-in" style="--d:6.6s;left:60px;top:1200px"><div class="ia-tag">${esc(H.path3Label)}</div><div class="ia-name">${esc(H.path3Title)}</div></div>
              <div class="ia-card ia-in" style="--d:7.1s;left:60px;top:1540px"><div class="ia-tag">${esc(H.path4Label)}</div><div class="ia-name">${esc(H.path4Title)}</div></div>
            </div>

            <!-- Szene 3: fünf Schritte, 10–15 s -->
            <div class="ia-scene" style="--start:10s;--len:5s">
              <div class="ia-eyebrow ia-in" style="--d:10.1s;top:150px">${esc(H.howEyebrow)}</div>
              <p class="ia-h2 ia-in" style="--d:10.3s;top:265px">${esc(H.howH2)}</p>
              <div class="ia-rail-v ia-draw-v" style="--d:11s"></div>
              <div class="ia-step-v" style="top:405px"><div class="ia-num ia-pop" style="--d:10.9s">1</div><div class="ia-stepname ia-in" style="--d:11.1s">${esc(H.step1Title)}</div></div>
              <div class="ia-step-v" style="top:645px"><div class="ia-num ia-pop" style="--d:11.3s">2</div><div class="ia-stepname ia-in" style="--d:11.5s">${esc(H.step2Title)}</div></div>
              <div class="ia-step-v" style="top:885px"><div class="ia-num ia-pop" style="--d:11.7s">3</div><div class="ia-stepname ia-in" style="--d:11.9s">${esc(H.step3Title)}</div></div>
              <div class="ia-step-v" style="top:1125px"><div class="ia-num ia-pop" style="--d:12.1s">4</div><div class="ia-stepname ia-in" style="--d:12.3s">${esc(H.step4Title)}</div></div>
              <div class="ia-step-v" style="top:1365px"><div class="ia-num ia-pop" style="--d:12.5s">5</div><div class="ia-stepname ia-in" style="--d:12.7s">${esc(H.step5Title)}</div></div>
              <p class="ia-body ia-in" style="--d:13.2s;top:1640px">${esc(H.howP)}</p>
            </div>

            <!-- Szene 4: Vertrauen, 15–19 s -->
            <div class="ia-scene" style="--start:15s;--len:4s">
              <svg class="ia-shield ia-pop" style="--d:15.2s;left:360px;top:420px" viewBox="0 0 24 24" fill="none" stroke="#1E7451" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>
              <p class="ia-h2 ia-in" style="--d:15.6s;top:960px;font-size:80px">${esc(H.trustH2)}</p>
            </div>

            <!-- Szene 5: Ansatz & CTA, 19–24 s -->
            <div class="ia-scene ia-last" style="--start:19s;--len:5s">
              <img class="ia-logo ia-pop" style="--d:19.2s;top:470px" src="/logo-mark.svg" alt="" width="260" height="260">
              <p class="ia-h2 ia-in" style="--d:19.6s;top:820px">${esc(H.approachH2)}</p>
              <div class="ia-ctawrap ia-in" style="--d:20.8s;top:1100px"><span class="ia-cta-text">${esc(H.heroCtaPrimary)}</span></div>
              <div class="ia-url ia-in" style="--d:21.8s;top:1250px">spenden.weiterwert.de/spenden</div>
            </div>

          </div>
        </div>
        <div class="ia-controls">
          <button type="button" id="iaToggleV" aria-pressed="false"><span class="ia-on-pause">${esc(H.introPause)}</span><span class="ia-on-play" hidden>${esc(H.introPlay)}</span><span class="ia-on-replay" hidden>${esc(H.introReplay)}</span></button>
        </div>
      </div>
    </div>
  </section>

  <!-- WER WIR SIND -->
  <section id="wer-wir-sind">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(H.whoEyebrow)}</span>
        <h2>${esc(H.whoH2)}</h2>
        <p>${esc(H.whoP)}</p>
      </div>

      <div class="approach-grid">
        <div class="approach-card">
          <div class="icon" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>
            </svg>
          </div>
          <h3>${esc(H.who1Title)}</h3>
          <p>${esc(H.who1Desc)}</p>
        </div>
        <div class="approach-card">
          <div class="icon" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>
            </svg>
          </div>
          <h3>${esc(H.who2Title)}</h3>
          <p>${esc(H.who2Desc)}</p>
        </div>
        <div class="approach-card">
          <div class="icon" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a9 9 0 110 18 9 9 0 010-18z"/><path d="M12 7v5l3 3"/>
            </svg>
          </div>
          <h3>${esc(H.who3Title)}</h3>
          <p>${esc(H.who3Desc)}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- VIER WEGE -->
  <section id="mitmachen" class="section-alt">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(H.pathsEyebrow)}</span>
        <h2>${esc(H.pathsH2)}</h2>
        <p>${esc(H.pathsP)}</p>
      </div>

      <div class="paths-grid">
        <div class="path-card">
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="12" rx="1.5"/><path d="M2 20h20"/><path d="M12 8v4"/>
            </svg>
          </div>
          <span class="path-label">${esc(H.path1Label)}</span>
          <h3>${esc(H.path1Title)}</h3>
          <p>${esc(H.path1Desc)}</p>
          <a href="${pfadFuer(lang, '/spenden')}" class="btn btn-primary btn-block">${esc(H.path1Btn)}</a>
        </div>

        <div class="path-card">
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.6.45 1 .95 1.1 1.7h5a2 2 0 011.1-1.7A6 6 0 0012 3z"/>
            </svg>
          </div>
          <span class="path-label">${esc(H.path2Label)}</span>
          <h3>${esc(H.path2Title)}</h3>
          <p>${esc(H.path2Desc)}</p>
          <a href="${pfadFuer(lang, '/beantragen')}" class="btn btn-primary btn-block">${esc(H.path2Btn)}</a>
        </div>

        <div class="path-card">
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 11h.01M15 11h.01"/>
            </svg>
          </div>
          <span class="path-label">${esc(H.path3Label)}</span>
          <h3>${esc(H.path3Title)}</h3>
          <p>${esc(H.path3Desc)}</p>
          <a href="mailto:weiterwert@gmail.com?subject=${encodeURIComponent(H.mailCorpSubject)}" class="btn btn-primary btn-block">${esc(H.path3Btn)}</a>
        </div>

        <div class="path-card">
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 13l2-6h14l2 6"/><rect x="3" y="13" width="18" height="5" rx="1.5"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/>
            </svg>
          </div>
          <span class="path-label">${esc(H.path4Label)}</span>
          <h3>${esc(H.path4Title)}</h3>
          <p>${esc(H.path4Desc)}</p>
          <a href="mailto:weiterwert@gmail.com?subject=${encodeURIComponent(H.mailVolunteerSubject)}" class="btn btn-primary btn-block">${esc(H.path4Btn)}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- PROZESS -->
  <section id="so-funktionierts">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(H.howEyebrow)}</span>
        <h2>${esc(H.howH2)}</h2>
        <p>${esc(H.howP)}</p>
      </div>

      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>
            </svg>
          </div>
          <h3>${esc(H.step1Title)}</h3>
          <p>${esc(H.step1Desc)}</p>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h3>${esc(H.step2Title)}</h3>
          <p>${esc(H.step2Desc)}</p>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.1-3.1a4 4 0 01-5.4 5.4L6 21l-3-3 9.6-9.6a4 4 0 015.4-5.4l-3.1 3.1z"/>
            </svg>
          </div>
          <h3>${esc(H.step3Title)}</h3>
          <p>${esc(H.step3Desc)}</p>
        </div>
        <div class="step">
          <div class="step-num">4</div>
          <div class="icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="12" rx="1.5"/><path d="M2 20h20"/><path d="M9 8h6M9 11h4"/>
            </svg>
          </div>
          <h3>${esc(H.step4Title)}</h3>
          <p>${esc(H.step4Desc)}</p>
        </div>
        <div class="step">
          <div class="step-num">5</div>
          <div class="icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 11l18-7-7 18-2-8-8-2z"/>
            </svg>
          </div>
          <h3>${esc(H.step5Title)}</h3>
          <p>${esc(H.step5Desc)}</p>
        </div>
      </div>

      <div class="callout">
        <div class="icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/>
          </svg>
        </div>
        <div class="callout-body">
          <h3>${esc(H.corpTitle)}</h3>
          <p>${esc(H.corpDesc)}</p>
        </div>
        <a href="mailto:weiterwert@gmail.com?subject=${encodeURIComponent(H.mailCorpSubject)}" class="btn btn-primary">${esc(H.corpBtn)}</a>
      </div>
    </div>
  </section>

  <!-- VERTRAUEN -->
  <section id="vertrauen" class="section-alt">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(H.trustEyebrow)}</span>
        <h2>${esc(H.trustH2)}</h2>
        <p>${esc(H.trustP)}</p>
      </div>

      <div class="story-grid">
        <article class="story-card">
          <div class="media">
            <!-- FOTO EINSETZEN: <img src="assets/img/story-1.jpg" alt="..." loading="lazy"> -->
            <svg class="media-icon" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-4L7 19"/>
            </svg>
            <span class="media-tag">${esc(H.mediaTag)}</span>
          </div>
          <h3>${esc(H.story1Title)}</h3>
          <p>${esc(H.story1Desc)}</p>
        </article>
        <article class="story-card">
          <div class="media">
            <!-- FOTO EINSETZEN: <img src="assets/img/story-2.jpg" alt="..." loading="lazy"> -->
            <svg class="media-icon" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-4L7 19"/>
            </svg>
            <span class="media-tag">${esc(H.mediaTag)}</span>
          </div>
          <h3>${esc(H.story2Title)}</h3>
          <p>${esc(H.story2Desc)}</p>
        </article>
        <article class="story-card">
          <div class="media">
            <!-- FOTO EINSETZEN: <img src="assets/img/story-3.jpg" alt="..." loading="lazy"> -->
            <svg class="media-icon" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-4L7 19"/>
            </svg>
            <span class="media-tag">${esc(H.mediaTag)}</span>
          </div>
          <h3>${esc(H.story3Title)}</h3>
          <p>${esc(H.story3Desc)}</p>
        </article>
      </div>

      <p class="note"><strong>${esc(H.storiesNoteTitle)}</strong><span> ${esc(H.storiesNote)}</span></p>

      <div class="info-grid">
        <div class="info-card">
          <div class="icon" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><path d="M17 11.5a3 3 0 100-6M18 20c-.4-2.6-1.8-4.4-3.8-5.2"/>
            </svg>
          </div>
          <h3>${esc(H.volTitle)}</h3>
          <p>${esc(H.volP)}</p>
        </div>
        <div class="info-card">
          <div class="icon" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3"/><rect x="8" y="8" width="8" height="8" rx="1"/>
            </svg>
          </div>
          <h3>${esc(H.receiptTitle)}</h3>
          <p>${esc(H.receiptDesc)}</p>
        </div>
      </div>

      <div class="roles-grid">
        <div class="role-card">
          <div class="avatar" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.1-3.1a4 4 0 01-5.4 5.4L6 21l-3-3 9.6-9.6a4 4 0 015.4-5.4l-3.1 3.1z"/>
            </svg>
          </div>
          <div>
            <h3>${esc(H.vol1Name)}</h3>
            <p>${esc(H.vol1Role)}</p>
          </div>
        </div>
        <div class="role-card">
          <div class="avatar" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 13l2-6h14l2 6"/><rect x="3" y="13" width="18" height="5" rx="1.5"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/>
            </svg>
          </div>
          <div>
            <h3>${esc(H.vol2Name)}</h3>
            <p>${esc(H.vol2Role)}</p>
          </div>
        </div>
        <div class="role-card">
          <div class="avatar" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
            </svg>
          </div>
          <div>
            <h3>${esc(H.vol3Name)}</h3>
            <p>${esc(H.vol3Role)}</p>
          </div>
        </div>
      </div>

      <div style="margin-top:40px;">
        <div class="section-head">
          <h2 style="font-size:1.35rem;margin-bottom:10px;">${esc(H.partnerTitle)}</h2>
          <p>${esc(H.partnerP)}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- UNSER ANSATZ -->
  <section id="unser-ansatz">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(H.approachEyebrow)}</span>
        <h2>${esc(H.approachH2)}</h2>
        <p>${esc(H.approachP)}</p>
      </div>

      <div class="approach-grid">
        <div class="approach-card">
          <div class="icon" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z"/><path d="M12 7v5l3 3"/>
            </svg>
          </div>
          <h3>${esc(H.approach1Title)}</h3>
          <p>${esc(H.approach1Desc)}</p>
        </div>
        <div class="approach-card">
          <div class="icon" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 14a5 5 0 100-10 5 5 0 000 10z"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>
            </svg>
          </div>
          <h3>${esc(H.approach2Title)}</h3>
          <p>${esc(H.approach2Desc)}</p>
        </div>
        <div class="approach-card">
          <div class="icon" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 20a4 4 0 00-10 0"/><circle cx="12" cy="10" r="4"/><path d="M21 20a4 4 0 00-3.4-4M3 20a4 4 0 013.4-4"/>
            </svg>
          </div>
          <h3>${esc(H.approach3Title)}</h3>
          <p>${esc(H.approach3Desc)}</p>
        </div>
      </div>

      <p class="note"><strong>${esc(H.noteStrong)}</strong><span> ${esc(H.noteRest)}</span></p>
    </div>
  </section>
`;
}
