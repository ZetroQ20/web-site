"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { SERVICES, SITE_CONFIG, formatDuration, formatPrice } from "@/lib/content";
import { useLenis } from "./providers/SmoothScroll";
import { WhatsApp } from "./icons";

/* ------------------------------------------------------------------ Context */

type OpenOptions = { category?: string };
type RitualCtx = { open: (opts?: OpenOptions) => void; close: () => void; isOpen: boolean };

const Ctx = createContext<RitualCtx | null>(null);

/** Opens the Ritual Builder from anywhere (navbar, service cards, booking section). */
export const useRitual = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRitual must be used inside <RitualProvider>");
  return ctx;
};

export function RitualProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [focusCategory, setFocusCategory] = useState<string | undefined>();
  const open = useCallback((opts?: OpenOptions) => {
    setFocusCategory(opts?.category);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <RitualBuilderModal isOpen={isOpen} onClose={close} focusCategory={focusCategory} />
    </Ctx.Provider>
  );
}

/* --------------------------------------------------------------------- Data */

type Item = { key: string; category: string; categoryTitle: string; name: string; price: number; minutes: number };

const ITEMS: Item[] = SERVICES.flatMap((s) =>
  s.items.map((it) => ({ key: `${s.no}-${it.name}`, category: s.no, categoryTitle: s.title, ...it }))
);

const SLOTS = [
  { id: "sabah", label: "Sabah", range: "09:30 – 12:00" },
  { id: "ogle", label: "Öğleden Sonra", range: "12:00 – 17:00" },
  { id: "aksam", label: "Akşam", range: "17:00 – 20:30" },
] as const;
type SlotId = (typeof SLOTS)[number]["id"];

const formatDay = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });

export function buildRitualMessage(name: string, items: Item[], total: number, day: string, slot: (typeof SLOTS)[number]) {
  return (
    `Merhaba THE GRACE, ben ${name.trim()}. ` +
    `Şu ritüeller için randevu oluşturmak istiyorum: ${items.map((i) => i.name).join(", ")}. ` +
    `(Tahmini Tutar: ${formatPrice(total)}). ` +
    `Tercih ettiğim zaman: ${formatDay(day)} / ${slot.label} (${slot.range}). ` +
    `Müsaitlik durumunuzu öğrenebilir miyim?`
  );
}

/* -------------------------------------------------------------------- Modal */

function RitualBuilderModal({ isOpen, onClose, focusCategory }: { isOpen: boolean; onClose: () => void; focusCategory?: string }) {
  const lenis = useLenis();
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState<SlotId | "">("");
  const [today, setToday] = useState("");

  useEffect(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setToday(d.toISOString().slice(0, 10));
  }, []);

  const chosen = useMemo(() => ITEMS.filter((i) => selected.includes(i.key)), [selected]);
  const total = chosen.reduce((sum, i) => sum + i.price, 0);
  const minutes = chosen.reduce((sum, i) => sum + i.minutes, 0);
  const slotObj = SLOTS.find((s) => s.id === slot);
  const canConfirm = chosen.length > 0 && name.trim().length >= 2 && !!day && !!slotObj;

  const toggle = (key: string) => setSelected((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));

  /* --- open / close choreography, scroll lock, focus --- */
  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  // Layout effect: the panel is positioned off-screen before the first paint (no flash).
  useLayoutEffect(() => {
    if (!mounted) return;
    const el = panel.current!;
    const bd = backdrop.current!;
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const from = desktop ? { xPercent: 100, yPercent: 0 } : { yPercent: 100, xPercent: 0 };
    const quick = prefersReducedMotion();

    if (isOpen) {
      lastFocus.current = document.activeElement as HTMLElement | null;
      lenis?.stop();
      document.documentElement.classList.add("ritual-open");
      gsap.set(el, from);
      gsap.to(bd, { autoAlpha: 1, duration: quick ? 0 : 0.5, ease: "power2.out" });
      gsap.to(el, { xPercent: 0, yPercent: 0, duration: quick ? 0 : 0.75, ease: "expo.out", onComplete: () => closeBtn.current?.focus({ preventScroll: true }) });
      if (focusCategory) {
        requestAnimationFrame(() => {
          const target = scroller.current?.querySelector<HTMLElement>(`[data-category="${focusCategory}"]`);
          if (target && scroller.current) scroller.current.scrollTop = target.offsetTop - 12;
        });
      }
    } else {
      gsap.to(bd, { autoAlpha: 0, duration: quick ? 0 : 0.4, ease: "power2.in" });
      gsap.to(el, {
        ...from,
        duration: quick ? 0 : 0.5,
        ease: "power3.in",
        onComplete: () => {
          setMounted(false);
          setStep(1);
          document.documentElement.classList.remove("ritual-open");
          lenis?.start();
          lastFocus.current?.focus?.({ preventScroll: true });
        },
      });
    }
  }, [isOpen, mounted, lenis, focusCategory]);

  // Esc closes; Tab stays inside the dialog.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>("button:not([disabled]), input, a[href]")].filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Each step starts at the top of its own scroll area.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [step]);

  const confirm = () => {
    if (!canConfirm || !slotObj) return;
    const url = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(buildRitualMessage(name, chosen, total, day, slotObj))}`;
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url; // popup blocked → same tab
  };

  if (!mounted) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[160]" role="dialog" aria-modal="true" aria-labelledby="ritual-title">
      {/* Backdrop */}
      <div ref={backdrop} onClick={onClose} className="invisible absolute inset-0 bg-noir/75 opacity-0 md:backdrop-blur-sm" aria-hidden />

      {/* Panel: bottom sheet on phones, right drawer from md */}
      <div
        ref={panel}
        className="absolute inset-x-0 bottom-0 flex h-screen h-[100dvh] flex-col overflow-hidden border-gold/15 bg-anthracite shadow-[0_-30px_80px_rgba(0,0,0,0.8)] md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[30rem] md:border-l"
      >
        <div className="glow -right-24 -top-24 h-72 w-72 opacity-25" aria-hidden />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-6 border-b border-white/10 px-5 pb-5 pt-6 md:px-8 md:pt-8">
          <div>
            <p className="text-[9px] uppercase tracking-[0.45em] text-gold/80">Ritüel Oluşturucu</p>
            <h2 id="ritual-title" className="mt-2 font-serif text-[1.65rem] italic leading-tight text-bone md:text-3xl">
              {step === 1 ? "Ritüelinizi kurgulayın" : "Zamanınızı seçin"}
            </h2>
            <ol className="mt-4 flex items-center gap-3 text-[9px] uppercase tracking-[0.35em]" aria-label="Adımlar">
              <li className={step === 1 ? "text-gold" : "text-bone/40"}>01 Ritüel</li>
              <li aria-hidden className="h-px w-6 bg-gold/30" />
              <li className={step === 2 ? "text-gold" : "text-bone/40"}>02 Zaman</li>
            </ol>
          </div>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            data-cursor="KAPAT"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-bone/70 transition-colors hover:border-gold/50 hover:text-gold-light"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div ref={scroller} data-lenis-prevent className="relative flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-8">
          {step === 1 ? (
            <div className="space-y-7">
              {SERVICES.map((s) => (
                <fieldset key={s.no} data-category={s.no} className={`rounded-sm ${focusCategory === s.no ? "ring-1 ring-gold/20 ring-offset-8 ring-offset-anthracite" : ""}`}>
                  <legend className="flex w-full items-baseline gap-3">
                    <span className="font-display text-sm tracking-[0.2em] text-gold">{s.no}</span>
                    <span className="font-display text-sm tracking-[0.12em] text-bone">{s.title}</span>
                  </legend>
                  <p className="mb-2 mt-1 text-[10px] uppercase tracking-[0.3em] text-bone/40">{s.subtitle}</p>
                  <ul className="divide-y divide-white/10 border-y border-white/10">
                    {s.items.map((it) => {
                      const key = `${s.no}-${it.name}`;
                      const on = selected.includes(key);
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            onClick={() => toggle(key)}
                            className="group flex min-h-[3.25rem] w-full items-center gap-4 py-3 text-left"
                          >
                            <span
                              aria-hidden
                              className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-300 ${
                                on ? "border-gold bg-gold text-noir" : "border-white/20 group-hover:border-gold/60"
                              }`}
                            >
                              <svg viewBox="0 0 16 16" className={`h-3 w-3 transition-transform duration-300 ${on ? "scale-100" : "scale-0"}`} fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 8.5 6.5 12 13 4.5" />
                              </svg>
                            </span>
                            <span className="flex-1">
                              <span className={`block text-[14px] transition-colors ${on ? "text-gold-light" : "text-bone/85"}`}>{it.name}</span>
                              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.25em] text-bone/35">{formatDuration(it.minutes)}</span>
                            </span>
                            <span className="font-serif text-[15px] italic text-gold">{formatPrice(it.price)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Selected rituals */}
              <div>
                <p className="mb-3 text-[9px] uppercase tracking-[0.4em] text-gold/80">Seçilen Ritüeller</p>
                <ul className="divide-y divide-white/10 border-y border-white/10">
                  {chosen.map((i) => (
                    <li key={i.key} className="flex items-center gap-3 py-3 text-[14px]">
                      <span className="flex-1 text-bone/85">{i.name}</span>
                      <span className="font-serif italic text-gold">{formatPrice(i.price)}</span>
                      <button type="button" onClick={() => toggle(i.key)} aria-label={`${i.name} kaldır`} className="-mr-2 flex h-9 w-9 items-center justify-center text-bone/40 hover:text-gold-light">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="field">
                <input id="ritual-name" autoComplete="name" placeholder=" " value={name} onChange={(e) => setName(e.target.value)} />
                <label htmlFor="ritual-name">Adınız</label>
                <span className="line" />
              </div>

              <div className="field field--float">
                <input id="ritual-day" type="date" min={today} value={day} onChange={(e) => setDay(e.target.value)} placeholder=" " />
                <label htmlFor="ritual-day">Tercih Ettiğiniz Gün</label>
                <span className="line" />
              </div>

              <div role="radiogroup" aria-label="Saat aralığı">
                <p className="mb-3 text-[9px] uppercase tracking-[0.4em] text-gold/80">Saat Aralığı</p>
                <div className="grid grid-cols-3 gap-2">
                  {SLOTS.map((s) => {
                    const on = slot === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setSlot(s.id)}
                        className={`flex min-h-[4.25rem] flex-col items-center justify-center gap-1 border px-2 text-center transition-colors duration-300 ${
                          on ? "border-gold bg-gold/10 text-gold-light" : "border-white/10 text-bone/70 hover:border-gold/40"
                        }`}
                      >
                        <span className="text-[12px] leading-tight">{s.label}</span>
                        <span className="text-[9px] tracking-[0.15em] text-bone/40">{s.range}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live summary + actions */}
        <div className="relative border-t border-white/10 bg-noir/60 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 md:px-8 md:pb-7">
          <div className="mb-4 flex items-end justify-between gap-4" aria-live="polite">
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-bone/45">Tahmini Başlangıç Tutarı</p>
              <p className="mt-1 font-serif text-2xl italic text-gold-light">{chosen.length ? formatPrice(total) : "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.35em] text-bone/45">Ortalama Süre</p>
              <p className="mt-1 text-[15px] text-bone">{chosen.length ? formatDuration(minutes) : "—"}</p>
            </div>
          </div>

          {step === 1 ? (
            <button
              type="button"
              disabled={!chosen.length}
              onClick={() => setStep(2)}
              data-cursor="DEVAM"
              className="btn-aura btn-aura--solid w-full justify-center !py-4 disabled:pointer-events-none disabled:opacity-40"
            >
              {chosen.length ? `${chosen.length} Ritüel ile Devam Et` : "Ritüel Seçin"}
            </button>
          ) : (
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-aura shrink-0 !px-5 !py-4" aria-label="Geri">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
              </button>
              <button
                type="button"
                disabled={!canConfirm}
                onClick={confirm}
                data-cursor="GÖNDER"
                className="btn-aura btn-aura--solid flex-1 justify-center !whitespace-normal !px-4 !py-3.5 text-center !leading-snug !tracking-[0.14em] disabled:pointer-events-none disabled:opacity-40"
              >
                <WhatsApp className="h-4 w-4" />
                Randevuyu WhatsApp ile Onayla
              </button>
            </div>
          )}
          <p className="mt-3 text-center text-[10px] leading-relaxed text-bone/35">
            Fiyatlar başlangıç fiyatıdır; kesin tutar ön görüşmede netleşir.
          </p>
        </div>
      </div>
    </div>
  );
}
