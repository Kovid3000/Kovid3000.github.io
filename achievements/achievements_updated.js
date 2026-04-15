/* ============================================================
   achievements.js  –  Kovid Dutt Sharma Portfolio
   Replaces the hero right-card with an Achievements slideshow.
   • Correct paths: Achievements/Kovid's Achievements_N.jpg
   • Dot navigation  |  Auto-slide  |  Tap → full-screen lightbox
   ============================================================ */

(function () {
  "use strict";

  /* ── Config ─────────────────────────────────────────────── */
  const TOTAL   = 15;
  const AUTO_MS = 3500;

  const imgs = Array.from({ length: TOTAL }, (_, i) => ({
    src: `Achievements/Kovid's Achievements_${i + 1}.jpg`,
    alt: `Kovid's Achievement ${i + 1}`,
  }));

  /* ── Styles ──────────────────────────────────────────────── */
  const css = document.createElement("style");
  css.textContent = `
    /* ─── Achievement card ─── */
    .ach-card {
      display: flex !important;
      flex-direction: column;
      gap: .6rem;
      padding: 1rem 1rem .8rem;
    }

    .ach-card-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      color: #c8ff60;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin: 0;
    }

    /* ─── Slideshow frame ─── */
    .ach-frame {
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      background: #0a1a0a;
      cursor: zoom-in;
      width: 100%;
      aspect-ratio: 4 / 3;
    }

    .ach-frame img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity .55s ease;
      user-select: none;
      -webkit-user-drag: none;
    }

    .ach-frame img.ach-active { opacity: 1; }

    .ach-frame::after {
      content: "⤢ tap to expand";
      position: absolute;
      bottom: .45rem;
      right: .55rem;
      font-size: .6rem;
      font-family: 'Orbitron', sans-serif;
      color: rgba(200,255,96,.8);
      background: rgba(0,0,0,.5);
      padding: .12rem .38rem;
      border-radius: 4px;
      pointer-events: none;
      letter-spacing: .04em;
    }

    /* ─── Dots ─── */
    .ach-dots {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 5px;
      padding: .15rem 0;
    }

    .ach-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: rgba(200,255,96,.2);
      border: 1px solid rgba(200,255,96,.45);
      cursor: pointer;
      transition: background .25s, transform .2s;
      padding: 0;
      flex-shrink: 0;
    }

    .ach-dot.ach-dot-active {
      background: #c8ff60;
      transform: scale(1.4);
    }

    /* ─── Lightbox ─── */
    #ach-lb {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(0,0,0,.95);
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    #ach-lb.open { display: flex; }

    #ach-lb-img {
      max-width: min(92vw, 960px);
      max-height: 80vh;
      border-radius: 10px;
      object-fit: contain;
      box-shadow: 0 0 60px rgba(200,255,96,.2);
      user-select: none;
    }

    #ach-lb-caption {
      color: #c8ff60;
      font-family: 'Orbitron', sans-serif;
      font-size: .78rem;
      letter-spacing: .1em;
    }

    .ach-lb-row {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }

    .ach-lb-nav {
      background: rgba(200,255,96,.1);
      border: 1px solid rgba(200,255,96,.4);
      color: #c8ff60;
      font-size: 1.4rem;
      width: 46px; height: 46px;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .2s;
    }

    .ach-lb-nav:hover { background: rgba(200,255,96,.25); }

    #ach-lb-close {
      position: absolute;
      top: .9rem; right: 1.1rem;
      background: none;
      border: 1px solid rgba(255,255,255,.25);
      color: #fff;
      font-size: 1.5rem;
      width: 40px; height: 40px;
      border-radius: 8px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: border-color .2s, color .2s;
    }

    #ach-lb-close:hover { color: #c8ff60; border-color: #c8ff60; }
  `;
  document.head.appendChild(css);

  /* ── State ───────────────────────────────────────────────── */
  let currentIdx = 0;
  let timer      = null;
  let imgEls     = [];
  let dotEls     = [];
  let lbIdx      = 0;
  let lb, lbImg, lbCaption;

  /* ── Build card inside .hero-card ───────────────────────── */
  function buildCard() {
    const heroCard = document.querySelector(".hero-card");
    if (!heroCard) { console.warn("[achievements] .hero-card not found"); return false; }

    heroCard.innerHTML = "";
    heroCard.classList.add("ach-card");

    /* Title */
    const title = document.createElement("h2");
    title.className   = "ach-card-title";
    title.textContent = "Achievements";
    heroCard.appendChild(title);

    /* Slideshow frame */
    const frame = document.createElement("div");
    frame.className = "ach-frame";
    frame.setAttribute("role", "img");
    frame.setAttribute("aria-label", "Achievement slideshow – tap to enlarge");

    imgEls = imgs.map((item, idx) => {
      const el     = document.createElement("img");
      el.src       = item.src;
      el.alt       = item.alt;
      el.loading   = idx === 0 ? "eager" : "lazy";
      if (idx === 0) el.classList.add("ach-active");
      frame.appendChild(el);
      return el;
    });

    frame.addEventListener("click", () => openLightbox(currentIdx));
    heroCard.appendChild(frame);

    /* Dots */
    const dotsWrap = document.createElement("div");
    dotsWrap.className = "ach-dots";

    dotEls = imgs.map((_, idx) => {
      const d = document.createElement("button");
      d.className = "ach-dot" + (idx === 0 ? " ach-dot-active" : "");
      d.setAttribute("aria-label", `Go to achievement ${idx + 1}`);
      d.addEventListener("click", () => { goTo(idx); resetTimer(); });
      dotsWrap.appendChild(d);
      return d;
    });

    heroCard.appendChild(dotsWrap);
    return true;
  }

  /* ── Slide logic ─────────────────────────────────────────── */
  function goTo(idx) {
    imgEls[currentIdx].classList.remove("ach-active");
    dotEls[currentIdx].classList.remove("ach-dot-active");
    currentIdx = (idx + TOTAL) % TOTAL;
    imgEls[currentIdx].classList.add("ach-active");
    dotEls[currentIdx].classList.add("ach-dot-active");
  }

  function startTimer()  { timer = setInterval(() => goTo(currentIdx + 1), AUTO_MS); }
  function resetTimer()  { clearInterval(timer); startTimer(); }
  function pauseTimer()  { clearInterval(timer); }
  function resumeTimer() { startTimer(); }

  /* ── Lightbox ────────────────────────────────────────────── */
  function buildLightbox() {
    lb = document.createElement("div");
    lb.id = "ach-lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML = `
      <button id="ach-lb-close" aria-label="Close">&#x2715;</button>
      <img id="ach-lb-img" src="" alt="" />
      <p id="ach-lb-caption"></p>
      <div class="ach-lb-row">
        <button class="ach-lb-nav" id="ach-lb-prev" aria-label="Previous">&#8592;</button>
        <button class="ach-lb-nav" id="ach-lb-next" aria-label="Next">&#8594;</button>
      </div>
    `;
    document.body.appendChild(lb);

    lbImg     = document.getElementById("ach-lb-img");
    lbCaption = document.getElementById("ach-lb-caption");

    document.getElementById("ach-lb-close").addEventListener("click", closeLightbox);
    document.getElementById("ach-lb-prev").addEventListener("click", () => lbNav(-1));
    document.getElementById("ach-lb-next").addEventListener("click", () => lbNav(+1));

    lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });

    document.addEventListener("keydown", e => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape")     closeLightbox();
      if (e.key === "ArrowLeft")  lbNav(-1);
      if (e.key === "ArrowRight") lbNav(+1);
    });

    /* Swipe */
    let tx = 0;
    lb.addEventListener("touchstart", e => { tx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend",   e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 45) lbNav(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function openLightbox(idx) {
    lbIdx = idx;
    showLb();
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    pauseTimer();
  }

  function closeLightbox() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    resumeTimer();
  }

  function lbNav(dir) {
    lbIdx = (lbIdx + dir + TOTAL) % TOTAL;
    showLb();
    goTo(lbIdx); // keep main slider in sync
  }

  function showLb() {
    lbImg.src = imgs[lbIdx].src;
    lbImg.alt = imgs[lbIdx].alt;
    lbCaption.textContent = `Achievement ${lbIdx + 1}  ·  ${lbIdx + 1} / ${TOTAL}`;
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    if (!buildCard()) return;
    buildLightbox();
    startTimer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
