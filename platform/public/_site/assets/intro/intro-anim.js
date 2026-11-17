// Homepage intro animation: scales the stage to its frame, starts it when visible,
// and gives the visitor a pause/play button. When the animation ends, the same button
// becomes "replay". Texts come from index.html's data-i18n dictionary.
// Two versions exist: landscape (desktop, 1920x1080) and portrait (phones, 1080x1920).
// Only the one that is shown has a size and intersects, so each starts only when visible.
(function () {
  function setup(frameId, stageId, toggleId) {
    var frame = document.getElementById(frameId);
    var stage = document.getElementById(stageId);
    var toggle = document.getElementById(toggleId);
    if (!frame || !stage || !toggle) return;

    // The frame keeps its aspect ratio in CSS, so only the scale is set here.
    function fit() {
      if (!frame.clientWidth) return; // hidden version
      stage.style.setProperty('--k', frame.clientWidth / stage.offsetWidth);
    }
    fit();
    window.addEventListener('resize', fit);

    // Start the timeline the first time at least 40% of the frame is on screen.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { frame.classList.add('ia-go'); io.disconnect(); }
        });
      }, { threshold: 0.4 });
      io.observe(frame);
    } else {
      frame.classList.add('ia-go');
    }

    // Which label the button shows: 'pause', 'play' or 'replay'.
    function show(state) {
      toggle.querySelector('.ia-on-pause').hidden = state !== 'pause';
      toggle.querySelector('.ia-on-play').hidden = state !== 'play';
      toggle.querySelector('.ia-on-replay').hidden = state !== 'replay';
      toggle.setAttribute('aria-pressed', state === 'play' ? 'true' : 'false');
    }

    // The last scene ends with ia-life-end, which fires animationend once per run.
    // A stale event can arrive just after a replay started, so check the animation is really finished.
    frame.addEventListener('animationend', function (e) {
      if (e.animationName !== 'ia-life-end') return;
      var done = e.target.getAnimations().some(function (a) {
        return a.animationName === 'ia-life-end' && a.playState === 'finished';
      });
      if (done) {
        frame.classList.add('ia-ended');
        show('replay');
      }
    });

    // Replay: rewind every animation in this frame to the start and play again.
    function restart() {
      frame.classList.remove('ia-ended', 'ia-paused');
      document.getAnimations().forEach(function (a) {
        var t = a.effect && a.effect.target;
        if (t && frame.contains(t)) { a.currentTime = 0; a.play(); }
      });
      show('pause');
    }

    toggle.addEventListener('click', function () {
      if (frame.classList.contains('ia-ended')) { restart(); return; }
      var paused = frame.classList.toggle('ia-paused');
      show(paused ? 'play' : 'pause');
    });
  }

  setup('iaFrame', 'iaStage', 'iaToggle');
  setup('iaFrameV', 'iaStageV', 'iaToggleV');
})();
