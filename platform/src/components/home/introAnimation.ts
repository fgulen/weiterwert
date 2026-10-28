// Hero animation on the homepage: scales the stage to its frame, starts it when visible,
// and gives the visitor a pause/play button. When the animation ends, the button becomes "replay".
// Two versions exist: landscape (desktop, 1920x1080) and portrait (phones, 1080x1920).
// Only the one that is shown has a size and intersects, so each starts only when visible.
// Called on every visit to the homepage (also after client-side navigation); each frame is set up once.

function setup(frameId: string, stageId: string, toggleId: string) {
  const frame = document.getElementById(frameId);
  const stage = document.getElementById(stageId);
  const toggle = document.getElementById(toggleId);
  if (!frame || !stage || !toggle) return;
  if (frame.dataset.iaReady) return;
  frame.dataset.iaReady = '1';

  // The frame keeps its aspect ratio in CSS, so only the scale is set here.
  const fit = () => {
    if (!frame.clientWidth) return; // hidden version
    stage.style.setProperty('--k', String(frame.clientWidth / stage.offsetWidth));
  };
  fit();
  window.addEventListener('resize', fit);

  // Start the timeline the first time at least 40% of the frame is on screen.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            frame.classList.add('ia-go');
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(frame);
  } else {
    frame.classList.add('ia-go');
  }

  // Which label the button shows: 'pause', 'play' or 'replay'.
  const show = (state: 'pause' | 'play' | 'replay') => {
    (toggle.querySelector('.ia-on-pause') as HTMLElement).hidden = state !== 'pause';
    (toggle.querySelector('.ia-on-play') as HTMLElement).hidden = state !== 'play';
    (toggle.querySelector('.ia-on-replay') as HTMLElement).hidden = state !== 'replay';
    toggle.setAttribute('aria-pressed', state === 'play' ? 'true' : 'false');
  };

  // A stale event can arrive just after a replay started, so check the animation is really finished.
  frame.addEventListener('animationend', (e) => {
    if ((e as AnimationEvent).animationName !== 'ia-life-end') return;
    const target = e.target as Element;
    const done = target
      .getAnimations()
      .some((a) => (a as CSSAnimation).animationName === 'ia-life-end' && a.playState === 'finished');
    if (done) {
      frame.classList.add('ia-ended');
      show('replay');
    }
  });

  // Replay: rewind every animation in this frame to the start and play again.
  const restart = () => {
    frame.classList.remove('ia-ended', 'ia-paused');
    document.getAnimations().forEach((a) => {
      const t = (a.effect as KeyframeEffect | null)?.target;
      if (t && frame.contains(t)) {
        a.currentTime = 0;
        a.play();
      }
    });
    show('pause');
  };

  toggle.addEventListener('click', () => {
    if (frame.classList.contains('ia-ended')) {
      restart();
      return;
    }
    const paused = frame.classList.toggle('ia-paused');
    show(paused ? 'play' : 'pause');
  });
}

export function initIntro() {
  setup('iaFrame', 'iaStage', 'iaToggle');
  setup('iaFrameV', 'iaStageV', 'iaToggleV');
}
