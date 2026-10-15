/* ÜÇDAĞ standalone — vanilla port of components/ajans/* behaviour over the prerendered markup. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof gsap !== "undefined";
  if (hasGsap && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "power3.out" });
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* ---------- broken photos fall back to the frame colour ---------- */
  $$("img").forEach((img) => {
    const fail = () => { if (!img.classList.contains("sh-fallback")) img.style.visibility = "hidden"; };
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
  });

  /* ---------- smooth scroll + anchors ---------- */
  let lenis = null;
  if (!reduced && typeof Lenis !== "undefined" && hasGsap) {
    lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.95, touchMultiplier: 1.4, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = e.target.closest('a[href^="#"]');
    const hash = a && a.getAttribute("href");
    if (!hash || hash === "#") return;
    e.preventDefault();
    if (hash === "#top") lenis ? lenis.scrollTo(0, { duration: 2 }) : scrollTo({ top: 0, behavior: "smooth" });
    else {
      const el = document.querySelector(hash);
      if (!el) return;
      lenis ? lenis.scrollTo(el, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) }) : el.scrollIntoView({ behavior: "smooth" });
    }
    history.replaceState(null, "", hash);
  });

  const lock = (on) => {
    document.documentElement.style.overflow = on ? "hidden" : "";
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  /* ---------- hero (liquid sculpture) ---------- */
  (function mountHero() {
    const root = $(".ajans-hero");
    if (!root || typeof LiquidEngine === "undefined") return;
    const SRC = {
      desk: "https://cdn.21st.dev/assets/mirror/a1/a1fa387b6e417b26a25f317559c87cce4d241c1052c52a2b3bc2966b2aaf9b65.webp",
      mob: "https://cdn.21st.dev/assets/mirror/9a/9a82cb59be1bfde59855b79d7a565e487155a89f4d52eac74dcc10e267b2b6d1.webp",
    };
    const BG = "#111110";
    const stage = $(".sh-stage", root), img = $(".sh-fallback", root), hint = $(".sh-hint", root);
    const nav = $(".sh-nav", root), content = $(".sh-content", root), backdrop = $(".sh-backdrop", root);
    if (matchMedia("(hover: none), (pointer: coarse)").matches && hint) hint.textContent = "Forma dokunun";
    const layout = { scale: 1, mobileScale: 1, x: 0, y: 0 };
    let aspect = 1983 / 793, mobile = null, engine = null, token = 0;
    const opts = (rm) => ({
      interactive: true, strength: 1, radius: 220, density: 1, dotSize: 1, spread: 1, turbulence: 1, liquid: 1.3,
      streaks: true, restStyle: "image", returnSpeed: 1, ambient: true, ambientIntensity: 0.9, speed: 1, intro: true,
      reducedMotion: rm, bg: hexToRgb(BG, [0.07, 0.07, 0.06]), imgBg: null,
    });
    function relayout() {
      const w = root.clientWidth, h = root.clientHeight, mob = w < 640;
      if (mob !== mobile) { mobile = mob; load(mob ? SRC.mob : SRC.desk); }
      const band = { top: nav.offsetTop + nav.offsetHeight + 8, bottom: content.offsetTop - 8 };
      if (mob && aspect < 1.3) band.bottom += content.offsetHeight * 0.3;
      const rect = computeRect(w, h, aspect, band, layout);
      const chars = Math.max(1, backdrop.textContent.length);
      backdrop.style.fontSize = Math.min((band.bottom - band.top) * 0.95, (w * 0.92) / (chars * 0.56)) + "px";
      backdrop.style.top = (band.top + band.bottom) / 2 + "px";
      Object.assign(img.style, { left: rect.x + "px", top: rect.y + "px", width: rect.w + "px", height: rect.h + "px" });
      if (hint) {
        hint.style.display = mob && aspect < 1.3 ? "none" : "";
        hint.style.left = clamp(rect.x + rect.w / 2, 80, w - 80) + "px";
        hint.style.top = Math.min(rect.y + rect.h * 0.95, band.bottom - 20) + "px";
      }
      engine && engine.resize(w, h, rect);
    }
    function load(src) {
      const t = ++token;
      img.src = src;
      const swapping = root.dataset.gl === "on";
      if (swapping) root.dataset.swap = "1";
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = () => {
        if (t !== token) return;
        aspect = image.naturalWidth / image.naturalHeight || aspect;
        relayout();
        if (engine && root.dataset.gl !== "off") {
          try {
            engine.onFirstFrame = () => { if (t === token) { root.dataset.gl = "on"; delete root.dataset.swap; } };
            engine.setImage(image);
            relayout();
          } catch (e) { root.dataset.gl = "off"; }
        } else delete root.dataset.swap;
      };
      image.onerror = () => { delete root.dataset.swap; };
      setTimeout(() => { if (t === token) image.src = src; }, swapping ? 280 : 0);
    }
    const canvas = document.createElement("canvas");
    canvas.className = "sh-canvas";
    stage.appendChild(canvas);
    try { engine = new LiquidEngine(canvas, opts(reduced), () => { root.dataset.gl = "off"; }); } catch (e) { root.dataset.gl = "off"; }
    new ResizeObserver(relayout).observe(root);
    new ResizeObserver(relayout).observe(content);
    new IntersectionObserver((es) => es.forEach((e) => engine && engine.setVisible(e.isIntersecting && !document.hidden))).observe(root);
    document.addEventListener("visibilitychange", () => engine && engine.setVisible(!document.hidden));
    document.fonts && document.fonts.ready.then(relayout);
    const pos = (e) => { const b = root.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    const touched = () => { root.dataset.touched = "1"; };
    root.addEventListener("pointermove", (e) => {
      const t = e.pointerType === "touch";
      if (t && e.buttons === 0 && e.pressure === 0) return;
      const [x, y] = pos(e); engine && engine.pointer("move", x, y, t); touched();
    }, { passive: true });
    root.addEventListener("pointerdown", (e) => { const [x, y] = pos(e); engine && engine.pointer("down", x, y, e.pointerType === "touch"); touched(); }, { passive: true });
    const up = (type) => (e) => { const [x, y] = pos(e); engine && engine.pointer(type, x, y, e.pointerType === "touch"); };
    root.addEventListener("pointerup", up("up"), { passive: true });
    root.addEventListener("pointercancel", up("up"), { passive: true });
    root.addEventListener("pointerleave", up("leave"), { passive: true });
    relayout();
  })();

  /* ---------- studio rhythm (ContributionSkyline via React) ---------- */
  (function mountSkyline() {
    const host = $("#ritim [data-reveal] > section") && $("#ritim [data-reveal] > section").parentElement;
    if (!host || typeof React === "undefined" || typeof ReactDOM === "undefined" || typeof ContributionSkyline === "undefined") return;
    const TR = {
      inLastYear: "— son bir yıl", yearTotal: "Yıllık toplam", busiestDay: "En yoğun gün", longestStreak: "En uzun seri",
      currentStreak: "Güncel seri", day: "gün", days: "gün", none: (p) => "Hiç " + p + " yok", on: "·", between: "·",
      less: "Az", more: "Çok", levels: ["Hafif", "Orta", "Yoğun", "Çok yoğun"], highlight: (l) => l + " günleri vurgula",
      hintFlat: "Bir günün üzerine gelin · ok tuşlarıyla gezinin", hintOrbit: "Sürükleyerek döndürün · çift tıkla sıfırlayın",
      viewGroup: "Grafik görünümü", flatView: "Isı haritası", skylineView: "3B silüet", shownAs: (v) => " — " + v + ".",
      keyboardHint: " Günleri tek tek okumak için ok tuşlarını kullanın.",
    };
    host.innerHTML = "";
    ReactDOM.createRoot(host).render(React.createElement(ContributionSkyline, {
      palette: { light: ["#e9dcc4", "#cdb68d", "#9c835c", "#5c4a31"], dark: ["#2a2620", "#5a4d3b", "#a8936f", "#f1e6d0"] },
      unit: "teslimat", unitPlural: "teslimat", locale: "tr-TR", weekStart: 1, labels: TR, heightScale: 1.1, duration: 1700,
    }));
  })();

  /* ---------- cursor (difference) ---------- */
  if (fine && hasGsap) {
    document.documentElement.classList.add("has-cursor");
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.className = "pointer-events-none fixed left-0 top-0 z-[400] grid h-4 w-4 place-items-center rounded-full bg-white mix-blend-difference";
    el.style.cssText = "width:16px;height:16px;position:fixed;left:0;top:0;z-index:400;border-radius:9999px;background:#fff;mix-blend-mode:difference;pointer-events:none;display:grid;place-items:center";
    const lab = document.createElement("span");
    lab.style.cssText = "font:600 2px/1 'Manrope Variable',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#000;white-space:nowrap;opacity:0;transition:opacity .2s";
    el.appendChild(lab);
    document.body.appendChild(el);
    gsap.set(el, { xPercent: -50, yPercent: -50, x: -200, y: -200 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    let state = "idle";
    const scaleOf = (s) => (s === "label" ? 7 : s === "link" ? 4 : 1);
    const apply = (next, text) => {
      if (next === state && next !== "label") return;
      state = next;
      lab.textContent = text || "";
      lab.style.opacity = text ? "1" : "0";
      gsap.to(el, { scale: scaleOf(next), duration: 0.55, ease: "expo.out" });
    };
    addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      const l = e.target.closest("[data-cursor]");
      if (l) return apply("label", l.dataset.cursor);
      if (e.target.closest("a, button, [role='button'], canvas, input, textarea")) return apply("link");
      apply("idle");
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => gsap.to(el, { opacity: 0, duration: 0.3 }));
    document.documentElement.addEventListener("pointerenter", () => gsap.to(el, { opacity: 1, duration: 0.3 }));
    addEventListener("pointerdown", () => gsap.to(el, { scale: scaleOf(state) * 0.8, duration: 0.2 }));
    addEventListener("pointerup", () => gsap.to(el, { scale: scaleOf(state), duration: 0.5, ease: "elastic.out(1, 0.5)" }));
  }

  /* ---------- magnetic wrappers ---------- */
  if (fine && hasGsap) {
    $$(".inline-block.will-change-transform").forEach((el) => {
      const strength = el.closest("header") ? 0.4 : 0.35;
      const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- phone menu ---------- */
  const menu = $("#mobil-menu");
  const openBtn = $('[aria-controls="mobil-menu"]');
  if (menu && openBtn) {
    const closeBtn = $("button", menu);
    const set = (open) => {
      menu.hidden = !open;
      openBtn.setAttribute("aria-expanded", String(open));
      lock(open);
      (open ? closeBtn : openBtn).focus();
    };
    openBtn.addEventListener("click", () => set(true));
    closeBtn.addEventListener("click", () => set(false));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) set(false); });
  }

  /* ---------- services: floating preview ---------- */
  (function services() {
    const root = $("#hizmetler");
    if (!root || !hasGsap) return;
    const preview = root.lastElementChild;
    const imgs = preview ? $$("img", preview) : [];
    let active = -1;
    const show = (i) => {
      if (i === active) return;
      active = i;
      imgs.forEach((im, k) => { im.style.opacity = k === i ? "1" : "0"; im.style.transform = k === i ? "scale(1)" : "scale(1.15)"; });
      gsap.to(preview, { clipPath: i >= 0 ? "inset(0% 0% 0% 0%)" : "inset(50% 50% 50% 50%)", opacity: i >= 0 ? 1 : 0, duration: 0.7, ease: "expo.out" });
    };
    $$("article.group", root).forEach((a, i) => a.addEventListener("pointerenter", () => show(i)));
    const list = $("ul", root);
    list && list.addEventListener("pointerleave", () => show(-1));
    if (!fine || reduced || !preview) return;
    gsap.set(preview, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(preview, "x", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(preview, "y", { duration: 0.7, ease: "power3.out" });
    const rTo = gsap.quickTo(preview, "rotation", { duration: 0.9, ease: "power3.out" });
    let lastX = 0;
    root.addEventListener("pointermove", (e) => {
      const r = root.getBoundingClientRect();
      xTo(e.clientX - r.left); yTo(e.clientY - r.top);
      rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    }, { passive: true });
  })();

  /* ---------- choreography ---------- */
  const header = $("header");
  function heroEntrance() {
    if (!hasGsap) { header && (header.style.opacity = "1"); return; }
    gsap.fromTo(header, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: "expo.out", delay: 0.6 });
    const hide = gsap.to(header, { yPercent: -110, duration: 0.5, ease: "power3.out", paused: true });
    ScrollTrigger.create({ start: 200, end: "max", onUpdate: (s) => (s.direction === 1 ? hide.play() : hide.reverse()), onLeaveBack: () => hide.reverse() });
    if (reduced) return;
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .to(".ajans-hero .sh-line", { yPercent: 0, clipPath: "inset(0% 0% -10% 0%)", duration: 1.6, stagger: 0.12 }, 0.15)
      .to(".ajans-hero .sh-eyebrow", { opacity: 1, y: 0, duration: 1.2 }, 0.1)
      .to(".ajans-hero .sh-aside", { opacity: 1, y: 0, duration: 1.4 }, 0.5);
  }

  if (hasGsap && !reduced) {
    gsap.set(".ajans-hero .sh-line", { yPercent: 105, clipPath: "inset(0% 0% 100% 0%)" });
    gsap.set(".ajans-hero .sh-eyebrow, .ajans-hero .sh-aside", { opacity: 0, y: 40 });
    $$("[data-split]").forEach((el) => {
      gsap.from(el.querySelectorAll(".mask > span"), { yPercent: 110, rotate: 4, duration: 1.4, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    gsap.set("[data-reveal]", { opacity: 0, y: 50 });
    ScrollTrigger.batch("[data-reveal]", { start: "top 90%", once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.4, ease: "expo.out", stagger: 0.1, overwrite: true }) });
    $$("[data-clip]").forEach((el) => gsap.from(el, { clipPath: "inset(18% 10% 18% 10%)", duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
    $$("[data-float]").forEach((el) => {
      const f = Number(el.dataset.float) || 0;
      gsap.fromTo(el, { y: f * 18 }, { y: -f * 18, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("[data-speed]").forEach((el) => {
      const s = Number(el.dataset.speed) || 0;
      gsap.fromTo(el, { yPercent: -s }, { yPercent: s, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    const words = $$("[data-words] .word");
    if (words.length) gsap.fromTo(words, { opacity: 0.12 }, { opacity: 1, ease: "none", stagger: 0.06, scrollTrigger: { trigger: "[data-words]", start: "top 75%", end: "bottom 40%", scrub: 0.8 } });
    const skew = gsap.quickTo("[data-skew]", "skewX", { duration: 0.6, ease: "power3.out" });
    ScrollTrigger.create({ onUpdate: (self) => skew(gsap.utils.clamp(-10, 10, self.getVelocity() / -260)) });
    gsap.to(".ajans-hero .sh-content", { yPercent: -22, opacity: 0, ease: "none", scrollTrigger: { trigger: ".ajans-hero", start: "top top", end: "bottom top", scrub: true } });
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ---------- preloader ---------- */
  const pre = $(".pl-char") && $(".pl-char").closest(".fixed");
  const ready = () => { lock(false); requestAnimationFrame(() => hasGsap && ScrollTrigger.refresh()); heroEntrance(); };
  if (!pre) return ready();
  if (reduced || !hasGsap) { pre.remove(); return ready(); }
  lock(true);
  const count = $("span.tabular-nums", pre);
  const counter = { v: 0 };
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from(".pl-char", { yPercent: 115, duration: 1.1, stagger: 0.055 })
    .from(".pl-line", { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "power3.inOut" }, 0)
    .to(counter, { v: 100, duration: 1.5, ease: "power2.inOut", onUpdate: () => { count.textContent = String(Math.round(counter.v)).padStart(3, "0"); } }, 0)
    .to(".pl-char", { yPercent: -115, duration: 0.7, stagger: 0.03, ease: "power3.in" }, "+=0.1")
    .add(ready, "-=0.1")
    .to(pre, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "-=0.15")
    .add(() => pre.remove());
})();
