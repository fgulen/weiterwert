// Homepage intro animation: scales the 1920x1080 stage to the frame, starts it when visible,
// and gives the visitor a pause/play button. Texts come from index.html's data-i18n dictionary.
(function () {
  var frame = document.getElementById('iaFrame');
  var stage = document.getElementById('iaStage');
  var toggle = document.getElementById('iaToggle');
  if (!frame || !stage || !toggle) return;

  // The frame keeps its 16:9 shape in CSS (aspect-ratio), so only the scale is set here.
  function fit() {
    stage.style.setProperty('--k', frame.clientWidth / 1920);
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

  toggle.addEventListener('click', function () {
    var paused = frame.classList.toggle('ia-paused');
    toggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
    toggle.querySelector('.ia-on-pause').hidden = paused;
    toggle.querySelector('.ia-on-play').hidden = !paused;
  });
})();
