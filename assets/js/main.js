/* georgekovacs.me — interactions & motion */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Smooth scroll (the Framer site uses Lenis via its SmoothScroll component) ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis === "function") {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // Same-page anchors (e.g. "Work" on the home page) go through Lenis so they glide.
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href*="#"]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.querySelector(url.hash);
    if (!target) return;
    event.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(target, { offset: -120 });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", url.hash);
  });

  /* ---------- Header: hide on scroll down, reveal on scroll up ---------- */
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector(".menu-toggle");
  let lastY = window.scrollY;

  function onScroll() {
    const y = Math.max(0, window.scrollY);
    const dy = y - lastY;
    header.classList.toggle("is-scrolled", y > 8);
    if (!header.classList.contains("menu-open")) {
      if (dy > 4 && y > header.offsetHeight) header.classList.add("is-hidden");
      else if (dy < -4 || y <= header.offsetHeight) header.classList.remove("is-hidden");
    }
    lastY = y;
    updateZoom();
  }

  function closeMenu() {
    if (!header.classList.contains("menu-open")) return;
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    header.classList.remove("is-hidden");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
  window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => e.matches && closeMenu());

  /* ---------- Hero text effect: words animate in, staggered per rendered line ---------- */
  function splitIntoWords(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    const words = [];
    textNodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = part;
        frag.append(span);
        words.push(span);
      });
      node.replaceWith(frag);
    });
    return words;
  }

  function assignLines(words) {
    let line = -1;
    let lastTop = null;
    words.forEach((word) => {
      const top = word.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 4) {
        line += 1;
        lastTop = top;
      }
      word.style.setProperty("--line", line);
    });
  }

  function runTextEffect(el) {
    const words = splitIntoWords(el);
    assignLines(words);
    el.classList.add("is-split");
    // Two frames so the initial state is painted before transitioning.
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));
  }

  // Wait for webfonts so line breaks are measured correctly, but never hold the headline back long.
  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]);
  fontsReady.then(() => {
    document.querySelectorAll("[data-split]").forEach((el) => {
      if (reduceMotion) el.classList.add("is-split", "is-in");
      else runTextEffect(el);
    });
  });

  /* ---------- Scroll-triggered appear ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Case-study hero: scroll-linked zoom 1.2 → 1 ---------- */
  const zoomEls = reduceMotion ? [] : [...document.querySelectorAll("[data-zoom]")];
  function updateZoom() {
    if (!zoomEls.length) return;
    const vh = window.innerHeight;
    zoomEls.forEach((wrap) => {
      const top = wrap.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0, (vh * 0.72 - top) / (vh * 0.64)));
      wrap.firstElementChild.style.transform = `scale(${(1.2 - 0.2 * progress).toFixed(4)})`;
    });
  }

  /* ---------- Copy email to clipboard ---------- */
  function legacyCopy(value) {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.append(field);
    field.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    field.remove();
    return ok;
  }

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return legacyCopy(value);
    }
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    let timer;
    button.addEventListener("click", async () => {
      const value = button.dataset.copy;
      if (!(await copyText(value))) {
        // Copying is blocked entirely: open the mail client instead.
        location.href = `mailto:${value}`;
        return;
      }
      button.classList.add("is-copied");
      button.setAttribute("aria-label", "Email address copied");
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.classList.remove("is-copied");
        button.setAttribute("aria-label", `Copy email address ${value}`);
      }, 2000);
    });
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateZoom, { passive: true });
  onScroll();
})();
