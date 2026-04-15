(function () {
  const loader = document.getElementById("loader");
  const smokeLayer = document.querySelector(".smoke-layer");
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");
  const scrollProgress = document.getElementById("scrollProgress");
  const toast = document.getElementById("toast");
  const visualFrame = document.getElementById("bbVisualFrame");
  const slides = Array.from(document.querySelectorAll(".bb-slide"));
  const slideDots = Array.from(document.querySelectorAll("#bbDots .dot"));
  const pageStart = Date.now();
  const SOUND_KEY = "bb_sound_enabled";

  const soundButtons = [
    document.getElementById("soundToggle"),
    document.getElementById("floatingSoundBtn")
  ].filter(Boolean);

  const shareButtons = [
    document.getElementById("shareBtn"),
    document.getElementById("floatingShareBtn"),
    document.getElementById("shareBtnMobile"),
    document.getElementById("heroShareBtn")
  ].filter(Boolean);

  const state = {
    soundEnabled: window.localStorage.getItem(SOUND_KEY) !== "off",
    audioContext: null,
    lastSoundAt: 0,
    toastTimer: null,
    slideIndex: 0,
    slideTimer: null
  };

  function hideLoader() {
    if (!loader) return;
    const elapsed = Date.now() - pageStart;
    const wait = Math.max(280, 1150 - elapsed);
    window.setTimeout(() => {
      loader.classList.add("is-hidden");
    }, wait);
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    if (state.toastTimer) window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1900);
  }

  function getAudioContext() {
    if (!state.soundEnabled) return null;
    if (!state.audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      state.audioContext = new Ctx();
    }

    if (state.audioContext.state === "suspended") {
      state.audioContext.resume().catch(() => {});
    }
    return state.audioContext;
  }

  function playTone(config) {
    if (!state.soundEnabled) return;
    const now = Date.now();
    if (now - state.lastSoundAt < 18) return;
    state.lastSoundAt = now;

    const ctx = getAudioContext();
    if (!ctx) return;

    const {
      frequency = 520,
      duration = 0.08,
      type = "sine",
      volume = 0.1,
      endFrequency = frequency
    } = config || {};

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime;
    const t1 = t0 + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, t0);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), t1);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, t1);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(t0);
    oscillator.stop(t1 + 0.012);
  }

  function playUiSound(kind) {
    if (!state.soundEnabled) return;
    if (kind === "share") {
      playTone({ frequency: 520, duration: 0.075, type: "triangle", volume: 0.12, endFrequency: 710 });
      window.setTimeout(() => {
        playTone({ frequency: 720, duration: 0.085, type: "triangle", volume: 0.13, endFrequency: 930 });
      }, 62);
      return;
    }

    if (kind === "toggle") {
      playTone({ frequency: 450, duration: 0.1, type: "square", volume: 0.12, endFrequency: 580 });
      return;
    }

    if (kind === "slide") {
      playTone({ frequency: 680, duration: 0.07, type: "sawtooth", volume: 0.11, endFrequency: 590 });
      return;
    }

    playTone({ frequency: 630, duration: 0.075, type: "triangle", volume: 0.12, endFrequency: 540 });
    window.setTimeout(() => {
      playTone({ frequency: 500, duration: 0.05, type: "sine", volume: 0.08, endFrequency: 460 });
    }, 38);
  }

  function updateSoundUi() {
    soundButtons.forEach((button) => {
      const icon = button.querySelector("i");
      const text = button.querySelector("span");
      button.setAttribute("aria-pressed", String(state.soundEnabled));
      if (icon) {
        icon.classList.remove("fa-volume-high", "fa-volume-xmark");
        icon.classList.add(state.soundEnabled ? "fa-volume-high" : "fa-volume-xmark");
      }
      if (text) {
        text.textContent = state.soundEnabled ? "Sound On" : "Sound Off";
      }
    });
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    window.localStorage.setItem(SOUND_KEY, state.soundEnabled ? "on" : "off");
    updateSoundUi();
    if (state.soundEnabled) {
      playUiSound("toggle");
      showToast("Sound effects enabled");
    } else {
      showToast("Sound effects disabled");
    }
  }

  function createRipple(target, event) {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    const diameter = Math.max(rect.width, rect.height);
    const offsetX = event.clientX || rect.left + rect.width / 2;
    const offsetY = event.clientY || rect.top + rect.height / 2;

    ripple.className = "ripple";
    ripple.style.width = `${diameter}px`;
    ripple.style.height = `${diameter}px`;
    ripple.style.left = `${offsetX - rect.left - diameter / 2}px`;
    ripple.style.top = `${offsetY - rect.top - diameter / 2}px`;
    target.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 680);
  }

  function createTapFlare(event) {
    const x = event.clientX;
    const y = event.clientY;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const flare = document.createElement("span");
    flare.className = "tap-flare";
    flare.style.left = `${x}px`;
    flare.style.top = `${y}px`;
    document.body.appendChild(flare);
    window.setTimeout(() => flare.remove(), 700);
  }

  function initRippleButtons() {
    const rippleTargets = document.querySelectorAll(
      ".ripple-btn, .nav-action, .floating-btn, .dock-btn, .nav-toggle"
    );

    rippleTargets.forEach((target) => {
      target.addEventListener("pointerdown", (event) => {
        createRipple(target, event);
      });
    });
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (primaryNav && primaryNav.classList.contains("is-open")) {
          primaryNav.classList.remove("is-open");
          if (navToggle) {
            navToggle.classList.remove("is-open");
            navToggle.setAttribute("aria-expanded", "false");
          }
        }
      });
    });
  }

  function initMobileNav() {
    if (!navToggle || !primaryNav) return;

    navToggle.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      if (window.innerWidth > 980) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!primaryNav.classList.contains("is-open")) return;
      if (primaryNav.contains(target) || navToggle.contains(target)) return;
      primaryNav.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  }

  function spawnSmokePuff() {
    if (!smokeLayer) return;
    const puff = document.createElement("span");
    const size = Math.random() * 92 + 50;
    puff.className = "smoke";
    puff.style.width = `${size}px`;
    puff.style.height = `${size}px`;
    puff.style.left = `${Math.random() * 100}%`;
    puff.style.animationDuration = `${Math.random() * 6 + 8}s`;
    puff.style.animationDelay = `${Math.random() * 0.8}s`;
    smokeLayer.appendChild(puff);
    puff.addEventListener("animationend", () => puff.remove());
  }

  function initSmoke() {
    const initial = window.innerWidth < 768 ? 8 : 12;
    for (let i = 0; i < initial; i += 1) spawnSmokePuff();
    window.setInterval(spawnSmokePuff, window.innerWidth < 768 ? 1000 : 820);
  }

  function initTypedText() {
    const target = document.getElementById("typed-target");
    if (!target || typeof window.Typed !== "function") return;
    new window.Typed("#typed-target", {
      strings: [
        "Student. Thinker. Future Genetic Engineer.",
        "Currently studying Biology and Biotechnology fundamentals.",
        "Focused on becoming a Biotechnology professional."
      ],
      typeSpeed: 40,
      backSpeed: 26,
      backDelay: 1150,
      loop: true,
      showCursor: true,
      cursorChar: "|"
    });
  }

  function initParticles() {
    if (typeof window.particlesJS !== "function") return;
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 64, density: { enable: true, value_area: 980 } },
        color: { value: ["#5cff5c", "#1f8b4c", "#c2ffc2"] },
        shape: { type: "circle" },
        opacity: { value: 0.36, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 130,
          color: "#2f8f44",
          opacity: 0.28,
          width: 1
        },
        move: {
          enable: true,
          speed: 1.25,
          direction: "none",
          out_mode: "out"
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" },
          resize: true
        },
        modes: {
          repulse: { distance: 95, duration: 0.35 },
          push: { particles_nb: 4 }
        }
      },
      retina_detect: true
    });
  }

  function initAos() {
    if (!window.AOS) return;
    window.AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 38
    });
  }

  function initGsapIntro() {
    if (!window.gsap) return;
    const tl = window.gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.from(".site-header", { y: -40, opacity: 0, duration: 0.75 })
      .from(".hero-kicker, .status-pill", { y: 20, opacity: 0, stagger: 0.08, duration: 0.45 }, "-=0.42")
      .from(".name-piece", { y: 30, opacity: 0, stagger: 0.14, duration: 0.55 }, "-=0.18")
      .from(".tagline, .typed-line", { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.25")
      .from(".hero-actions .btn", { y: 18, opacity: 0, stagger: 0.1, duration: 0.5 }, "-=0.28")
      .from(".hero-card", { x: 38, opacity: 0, duration: 0.6 }, "-=0.5")
      .from(".bb-image-strip .strip-card", { y: 18, opacity: 0, stagger: 0.08, duration: 0.42 }, "-=0.2");
  }

  function initScrollProgressAndSpy() {
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const navLinks = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
    if (!sections.length) return;

    let ticking = false;
    function update() {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const maxScroll = doc.scrollHeight - doc.clientHeight;
      const percent = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      if (scrollProgress) scrollProgress.style.width = `${Math.min(100, percent)}%`;

      let currentId = sections[0].id;
      const midpoint = scrollTop + window.innerHeight * 0.42;
      sections.forEach((section) => {
        if (section.offsetTop <= midpoint) currentId = section.id;
      });

      navLinks.forEach((link) => {
        const hash = link.getAttribute("href");
        link.classList.toggle("is-active", hash === `#${currentId}`);
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  function initCardTilt() {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    const cards = document.querySelectorAll(".section-card, .hero-card");

    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * 7;
        const rotateX = (0.5 - py) * 7;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  function initVisualSlider() {
    if (!slides.length) return;

    function setSlide(index) {
      state.slideIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === state.slideIndex));
      slideDots.forEach((dot, i) => dot.classList.toggle("is-active", i === state.slideIndex));
    }

    function nextSlide() {
      setSlide(state.slideIndex + 1);
    }

    setSlide(0);
    if (slides.length > 1) {
      state.slideTimer = window.setInterval(nextSlide, 3600);
    }

    if (visualFrame) {
      visualFrame.addEventListener("click", () => {
        nextSlide();
        playUiSound("slide");
      });
      visualFrame.addEventListener("mouseenter", () => {
        if (state.slideTimer) window.clearInterval(state.slideTimer);
      });
      visualFrame.addEventListener("mouseleave", () => {
        if (slides.length < 2) return;
        if (state.slideTimer) window.clearInterval(state.slideTimer);
        state.slideTimer = window.setInterval(nextSlide, 3600);
      });
    }
  }

  function markPressState(target) {
    if (!target) return;
    target.classList.add("is-pressed");
    window.setTimeout(() => target.classList.remove("is-pressed"), 160);
  }

  function initGlobalInteractionSounds() {
    const interactiveSelector = "a, button, .section-card";
    document.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest(interactiveSelector);
      if (!interactive) return;
      markPressState(interactive.closest(".section-card"));
      playUiSound("tap");
      createTapFlare(event);
    });
  }

  async function sharePortfolio() {
    const shareData = {
      title: "Kovid Dutt Sharma | Breaking Bad Portfolio",
      text: "Check out this Breaking Bad-themed portfolio.",
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        playUiSound("share");
        showToast("Shared successfully");
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        playUiSound("share");
        showToast("Link copied. Share it with Android users.");
        return;
      }

      playUiSound("share");
      showToast("Copy this URL from your browser bar to share.");
    } catch (error) {
      if (error && error.name === "AbortError") return;
      showToast("Unable to share right now.");
    }
  }

  function initShareButtons() {
    shareButtons.forEach((button) => {
      button.addEventListener("click", sharePortfolio);
    });
  }

  function initSoundControls() {
    updateSoundUi();
    soundButtons.forEach((button) => {
      button.addEventListener("click", () => {
        toggleSound();
      });
    });
  }

  function initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  function init() {
    initSmoothScroll();
    initMobileNav();
    initRippleButtons();
    initSmoke();
    initTypedText();
    initParticles();
    initAos();
    initGsapIntro();
    initScrollProgressAndSpy();
    initCardTilt();
    initVisualSlider();
    initGlobalInteractionSounds();
    initShareButtons();
    initSoundControls();
    initServiceWorker();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("load", hideLoader);
})();
