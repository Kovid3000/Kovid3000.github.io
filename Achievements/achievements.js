/* ============================================================
   achievements.js  –  Kovid Dutt Sharma Portfolio
   • Correct image paths: Achievements/Kovid's Achievements_N.jpg
   • Tap / click any image to open a full-screen lightbox
   ============================================================ */

(function () {
  "use strict";

  /* ── 1. Data ─────────────────────────────────────────────── */
  const TOTAL = 15;

  // Build filenames – folder is "Achievements" (capital A)
  // Apostrophe and spaces are safe in src but we encode for safety.
  const images = Array.from({ length: TOTAL }, (_, i) => {
    const n = i + 1;
    // Raw path: Achievements/Kovid's Achievements_N.jpg
    return {
      src: `Achievements/Kovid%27s%20Achievements_${n}.jpg`,
      alt: `Kovid's Achievement ${n}`,
      label: `Achievement ${n}`,
    };
  });

  /* ── 2. Inject CSS (scoped, no external file needed) ──────── */
  const style = document.createElement("style");
  style.textContent = `
    /* ── Achievements Section ── */
    #achievements {
      padding: 5rem 1.5rem 4rem;
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.25rem;
      margin-top: 2rem;
    }

    .ach-thumb {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      transition: transform .25s, box-shadow .25s;
      aspect-ratio: 4/3;
    }

    .ach-thumb:hover,
    .ach-thumb:focus-visible {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 28px rgba(0,255,80,.18);
      outline: 2px solid #0f0;
    }

    .ach-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: opacity .3s;
    }

    .ach-thumb img.loading {
      opacity: 0;
    }

    .ach-thumb .ach-label {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: .35rem .6rem;
      background: linear-gradient(transparent, rgba(0,0,0,.72));
      color: #e0ffe0;
      font-size: .72rem;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: .05em;
      opacity: 0;
      transition: opacity .25s;
    }

    .ach-thumb:hover .ach-label,
    .ach-thumb:focus-visible .ach-label {
      opacity: 1;
    }

    /* ── Lightbox ── */
    #ach-lightbox {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0,0,0,.93);
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 1rem;
    }

    #ach-lightbox.open {
      display: flex;
    }

    #ach-lightbox img {
      max-width: min(90vw, 900px);
      max-height: 80vh;
      border-radius: 10px;
      box-shadow: 0 0 50px rgba(0,255,80,.25);
      object-fit: contain;
      user-select: none;
    }

    #ach-lb-caption {
      color: #8fff8f;
      font-family: 'Orbitron', sans-serif;
      font-size: .85rem;
      letter-spacing: .08em;
    }

    /* nav row */
    .ach-lb-controls {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .ach-lb-btn {
      background: rgba(0,255,80,.12);
      border: 1px solid rgba(0,255,80,.35);
      color: #0f0;
      font-size: 1.4rem;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .2s;
    }

    .ach-lb-btn:hover {
      background: rgba(0,255,80,.28);
    }

    #ach-lb-close {
      position: absolute;
      top: 1rem;
      right: 1.2rem;
      background: none;
      border: none;
      color: #fff;
      font-size: 2rem;
      cursor: pointer;
      line-height: 1;
      padding: .25rem .5rem;
      border-radius: 6px;
      transition: color .2s;
    }

    #ach-lb-close:hover { color: #0f0; }

    /* Fade-in animation for grid items */
    @keyframes achFadeUp {
      from { opacity:0; transform:translateY(20px); }
      to   { opacity:1; transform:translateY(0); }
    }

    .ach-thumb { animation: achFadeUp .4s both; }
  `;
  document.head.appendChild(style);

  /* ── 3. Build Section HTML ───────────────────────────────── */
  function buildSection() {
    // Find insertion point – after #contact section
    const contact = document.getElementById("contact");
    if (!contact) return;

    const section = document.createElement("section");
    section.id = "achievements";
    section.className = "section";
    section.setAttribute("data-aos", "fade-up");

    section.innerHTML = `
      <div class="block-header-wrapper section-title" data-aos="fade-up">
        <h2 class="block-header-title">
          <span class="block-header-marker">&gt;</span> Achievements
        </h2>
        <div class="block-header-line"></div>
      </div>
      <div class="achievements-grid" id="achGrid" role="list"
           aria-label="Achievement images – tap to view full size"></div>
    `;

    contact.insertAdjacentElement("afterend", section);
    populateGrid(section.querySelector("#achGrid"));
  }

  /* ── 4. Populate Grid ────────────────────────────────────── */
  function populateGrid(grid) {
    images.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "ach-thumb glass-card";
      card.setAttribute("role", "listitem");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `View ${item.alt}`);
      card.style.animationDelay = `${idx * 0.04}s`;

      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt;
      img.loading = "lazy";
      img.className = "loading";
      img.addEventListener("load",  () => img.classList.remove("loading"));
      img.addEventListener("error", () => {
        img.src = ""; // blank on error so layout doesn't break
        card.style.opacity = ".35";
      });

      const lbl = document.createElement("span");
      lbl.className = "ach-label";
      lbl.textContent = item.label;

      card.appendChild(img);
      card.appendChild(lbl);

      // Open lightbox on click or Enter/Space
      const open = () => openLightbox(idx);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });

      grid.appendChild(card);
    });
  }

  /* ── 5. Lightbox ─────────────────────────────────────────── */
  let currentIdx = 0;
  let lb, lbImg, lbCaption, lbPrev, lbNext, lbClose;

  function buildLightbox() {
    lb = document.createElement("div");
    lb.id = "ach-lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Achievement image viewer");

    lb.innerHTML = `
      <button id="ach-lb-close" aria-label="Close">&times;</button>
      <img id="ach-lb-img" src="" alt="" />
      <p id="ach-lb-caption"></p>
      <div class="ach-lb-controls">
        <button class="ach-lb-btn" id="ach-lb-prev" aria-label="Previous">&#8592;</button>
        <button class="ach-lb-btn" id="ach-lb-next" aria-label="Next">&#8594;</button>
      </div>
    `;

    document.body.appendChild(lb);

    lbImg     = lb.querySelector("#ach-lb-img");
    lbCaption = lb.querySelector("#ach-lb-caption");
    lbPrev    = lb.querySelector("#ach-lb-prev");
    lbNext    = lb.querySelector("#ach-lb-next");
    lbClose   = lb.querySelector("#ach-lb-close");

    lbClose.addEventListener("click", closeLightbox);
    lbPrev.addEventListener("click",  () => navigate(-1));
    lbNext.addEventListener("click",  () => navigate(+1));

    // Close on backdrop click
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape")      closeLightbox();
      if (e.key === "ArrowLeft")   navigate(-1);
      if (e.key === "ArrowRight")  navigate(+1);
    });

    // Swipe support for mobile
    let touchStartX = 0;
    lb.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend",   (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function openLightbox(idx) {
    currentIdx = idx;
    showImage();
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function closeLightbox() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }

  function navigate(dir) {
    currentIdx = (currentIdx + dir + images.length) % images.length;
    showImage();
  }

  function showImage() {
    const item = images[currentIdx];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCaption.textContent = `${item.label}  (${currentIdx + 1} / ${images.length})`;
  }

  /* ── 6. Add Achievements link to nav ─────────────────────── */
  function addNavLink() {
    const nav = document.querySelector("#primaryNav");
    if (!nav) return;
    // Only add if not already present
    if (nav.querySelector('a[href="#achievements"]')) return;
    const contactLink = Array.from(nav.querySelectorAll("a")).find(a => a.getAttribute("href") === "#contact");
    const link = document.createElement("a");
    link.href = "#achievements";
    link.textContent = "Achievements";
    if (contactLink) {
      contactLink.insertAdjacentElement("afterend", link);
    } else {
      nav.prepend(link);
    }
  }

  /* ── 7. Init ─────────────────────────────────────────────── */
  function init() {
    buildSection();
    buildLightbox();
    addNavLink();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
