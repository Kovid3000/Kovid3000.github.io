(function () {
  const IMAGE_NAMES = [
    "Kovid's Achievements_1.jpg",
    "Kovid's Achievements_2.jpg",
    "Kovid's Achievements_3.jpg",
    "Kovid's Achievements_4.jpg",
    "Kovid's Achievements_5.jpg",
    "Kovid's Achievements_6.jpg",
    "Kovid's Achievements_7.jpg",
    "Kovid's Achievements_8.jpg",
    "Kovid's Achievements_9.jpg",
    "Kovid's Achievements_10.jpg",
    "Kovid's Achievements_11.jpg",
    "Kovid's Achievements_12.jpg",
    "Kovid's Achievements_13.jpg",
    "Kovid's Achievements_14.jpg",
    "Kovid's Achievements_15.jpg"
  ];

  const AUTOPLAY_MS = 3600;
  const MOUNT_ID = "achievementsMount";

  function sectionTemplate() {
    return `
      <section class="achievements-widget" id="achievementsWidget" aria-label="Achievements">
        <div class="achievements-header">
          <h2>Achievements</h2>
        </div>
        <div class="achievements-slider" id="achievementsSlider" tabindex="0" aria-roledescription="carousel" aria-label="Achievement certificates slideshow">
          <div class="achievements-track" id="achievementsTrack" aria-live="polite"></div>
          <button class="achievements-nav achievements-prev" id="achievementsPrev" type="button" aria-label="Previous achievement"><span aria-hidden="true">&#10094;</span></button>
          <button class="achievements-nav achievements-next" id="achievementsNext" type="button" aria-label="Next achievement"><span aria-hidden="true">&#10095;</span></button>
        </div>
        <div class="achievements-dots" id="achievementsDots" role="tablist" aria-label="Achievement slide indicators"></div>
      </section>
    `;
  }

  async function mountSection() {
    let mount = document.getElementById(MOUNT_ID);
    if (!mount) {
      mount = document.createElement("div");
      mount.id = MOUNT_ID;
      document.body.appendChild(mount);
    }

    try {
      const response = await fetch("achievements.html", { cache: "no-cache" });
      if (response.ok) {
        mount.innerHTML = await response.text();
      } else {
        mount.innerHTML = sectionTemplate();
      }
    } catch (_error) {
      mount.innerHTML = sectionTemplate();
    }
  }

  function buildSlides(track, dotsWrap) {
    IMAGE_NAMES.forEach((name, index) => {
      const figure = document.createElement("figure");
      figure.className = `achievement-slide${index === 0 ? " is-active" : ""}`;
      figure.setAttribute("role", "group");
      figure.setAttribute("aria-roledescription", "slide");
      figure.setAttribute("aria-label", `Achievement certificate ${index + 1} of ${IMAGE_NAMES.length}`);

      const img = document.createElement("img");
      img.src = `Achievements/${name}`;
      img.alt = `Achievement certificate ${index + 1} - ${name}`;
      img.loading = "lazy";
      img.decoding = "async";
      figure.appendChild(img);

      const dot = document.createElement("button");
      dot.className = `achievements-dot${index === 0 ? " is-active" : ""}`;
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to certificate ${index + 1}`);
      dot.dataset.index = String(index);

      track.appendChild(figure);
      dotsWrap.appendChild(dot);
    });
  }

  function initSlider() {
    const slider = document.getElementById("achievementsSlider");
    const track = document.getElementById("achievementsTrack");
    const dotsWrap = document.getElementById("achievementsDots");
    const prevBtn = document.getElementById("achievementsPrev");
    const nextBtn = document.getElementById("achievementsNext");
    if (!slider || !track || !dotsWrap || !prevBtn || !nextBtn) return;

    buildSlides(track, dotsWrap);

    const slides = Array.from(track.querySelectorAll(".achievement-slide"));
    const dots = Array.from(dotsWrap.querySelectorAll(".achievements-dot"));
    let index = 0;
    let timer = null;
    let paused = false;

    function render() {
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    }

    function goTo(newIndex) {
      index = (newIndex + slides.length) % slides.length;
      render();
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    function startAuto() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(() => {
        if (!paused) next();
      }, AUTOPLAY_MS);
    }

    function pauseAuto() {
      paused = true;
    }

    function resumeAuto() {
      paused = false;
    }

    prevBtn.addEventListener("click", () => {
      prev();
      startAuto();
    });
    nextBtn.addEventListener("click", () => {
      next();
      startAuto();
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goTo(Number(dot.dataset.index));
        startAuto();
      });
    });

    slider.addEventListener("mouseenter", pauseAuto);
    slider.addEventListener("mouseleave", resumeAuto);
    slider.addEventListener("focusin", pauseAuto);
    slider.addEventListener("focusout", resumeAuto);

    slider.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        next();
        startAuto();
      } else if (event.key === "ArrowLeft") {
        prev();
        startAuto();
      }
    });

    render();
    startAuto();
  }

  function forcePinTopRight() {
    const widget = document.getElementById("achievementsWidget");
    if (!widget) return;
    widget.style.setProperty("position", "fixed", "important");
    widget.style.setProperty("top", "calc(88px + env(safe-area-inset-top))", "important");
    widget.style.setProperty("right", "12px", "important");
    widget.style.setProperty("left", "auto", "important");
    widget.style.setProperty("transform", "none", "important");
  }

  function initImageLightbox() {
    if (document.getElementById("achievementsLightbox")) return;

    const overlay = document.createElement("div");
    overlay.id = "achievementsLightbox";
    overlay.className = "achievements-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Fullscreen image viewer");
    overlay.innerHTML = `
      <button type="button" class="achievements-lightbox-close" aria-label="Close fullscreen image">&times;</button>
      <img src="" alt="" />
      <p class="achievements-lightbox-caption"></p>
    `;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector(".achievements-lightbox-close");
    const imageEl = overlay.querySelector("img");
    const captionEl = overlay.querySelector(".achievements-lightbox-caption");

    function close() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    }

    function open(img) {
      imageEl.src = img.currentSrc || img.src;
      imageEl.alt = img.alt || "Fullscreen image";
      captionEl.textContent = img.alt || "";
      overlay.classList.add("is-open");
      overlay.removeAttribute("aria-hidden");
    }

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof HTMLImageElement)) return;
        if (overlay.contains(target)) return;

        const allowed = target.closest(
          "#main-content, #achievementsWidget, .bb-visual-frame, .bb-image-strip"
        );
        if (!allowed) return;

        event.preventDefault();
        event.stopPropagation();
        open(target);
      },
      true
    );
  }

  async function init() {
    await mountSection();
    forcePinTopRight();
    initSlider();
    initImageLightbox();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
