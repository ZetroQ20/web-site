"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { SITE_CONFIG, SERVICES } from "@/lib/content";
import { scrollToTarget, useLenis } from "./providers/SmoothScroll";
import Magnetic from "./Magnetic";
import { ArrowUpRight, Clock, Instagram, Phone, Pin, WhatsApp } from "./icons";
import { useRitual } from "./RitualBuilderModal";

type Form = { name: string; phone: string; service: string; date: string; time: string; note: string };
const EMPTY: Form = { name: "", phone: "", service: "", date: "", time: "", note: "" };

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });

function buildMessage(f: Form) {
  const lines: (string | null)[] = [
    "Merhaba THE GRACE ✨",
    "Web sitenizden randevu talebi oluşturmak istiyorum.",
    "",
    `• Ad Soyad: ${f.name.trim()}`,
    `• Telefon: ${f.phone.trim()}`,
    `• Hizmet: ${f.service}`,
    f.date ? `• Tercih edilen tarih: ${formatDate(f.date)}` : null,
    f.time ? `• Tercih edilen saat: ${f.time}` : null,
    f.note.trim() ? `• Not: ${f.note.trim()}` : null,
    "",
    "Uygunluk durumunuzu bekliyorum. Teşekkürler.",
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export default function Booking() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const ritual = useRitual();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sent, setSent] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setToday(d.toISOString().slice(0, 10));
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(q(".bk-giant"), { xPercent: 5 }, { xPercent: -5, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true } });
      gsap.from(q(".bk-title"), { yPercent: 110, duration: 1.4, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 70%" } });
      gsap.from(q(".bk-fade"), { y: 40, autoAlpha: 0, duration: 1.2, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: root.current, start: "top 60%" } });
    },
    { scope: root }
  );

  const set = (k: keyof Form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (form.name.trim().length < 2) next.name = "Lütfen adınızı yazın.";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Geçerli bir telefon numarası girin.";
    if (!form.service) next.service = "Bir hizmet seçin.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const url = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(buildMessage(form))}`;
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url; // popup blocked → same tab
    setSent(true);
    setTimeout(() => setSent(false), 6000);
  };

  return (
    <section ref={root} id="iletisim" className="relative overflow-hidden bg-anthracite pt-32 md:pt-44" aria-label="Rezervasyon ve iletişim">
      {/* Giant backdrop wordmark */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[8%] flex select-none justify-center md:bottom-[9%]">
        <span className="bk-giant whitespace-nowrap font-display text-[13.5vw] leading-none tracking-[0.02em] text-transparent [-webkit-text-stroke:1px_rgba(197,168,128,0.16)]">
          THE GRACE
        </span>
      </div>
      <div className="glow left-[5vw] top-[20%] h-[70vh] w-[70vh] opacity-30" />

      <div className="relative mx-auto grid max-w-[1600px] grid-cols-1 gap-20 px-5 md:px-12 lg:grid-cols-12 lg:gap-10">
        {/* Booking form */}
        <div className="lg:col-span-6">
          <p className="bk-fade mb-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.5em] text-gold/80">
            <span className="h-px w-12 bg-gold/60" /> Rezervasyon
          </p>
          <h2 className="font-display text-[clamp(2.4rem,5.5vw,5.5rem)] font-medium leading-[0.95] text-bone">
            <span className="mask block"><span className="bk-title block">RANDEVUNUZU</span></span>
            <span className="mask block"><span className="bk-title block font-serif italic text-gold-gradient shimmer">oluşturun</span></span>
          </h2>

          {/* Multi-service visitors: the Ritual Builder adds up price & duration live */}
          <button
            type="button"
            onClick={() => ritual.open()}
            aria-haspopup="dialog"
            data-cursor="OLUŞTUR"
            className="bk-fade group mt-10 flex w-full items-center justify-between gap-6 border border-gold/25 bg-gold/[0.04] px-5 py-5 text-left transition-colors duration-500 hover:border-gold/60 md:px-7"
          >
            <span>
              <span className="block text-[9px] uppercase tracking-[0.4em] text-gold/80">Birden fazla hizmet mi?</span>
              <span className="mt-1.5 block font-serif text-lg italic text-bone md:text-xl">Ritüel Oluşturucu ile tutarı anında görün</span>
            </span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition-transform duration-500 group-hover:translate-x-1">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </button>

          <form onSubmit={onSubmit} noValidate className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
            <Field id="name" label="Ad Soyad" error={errors.name}>
              <input id="name" name="name" autoComplete="name" placeholder=" " value={form.name} onChange={set("name")} aria-invalid={!!errors.name} />
            </Field>
            <Field id="phone" label="Telefon" error={errors.phone}>
              <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder=" " value={form.phone} onChange={set("phone")} aria-invalid={!!errors.phone} />
            </Field>
            <Field id="service" label="Hizmet" error={errors.service} className="md:col-span-2">
              <select id="service" name="service" value={form.service} onChange={set("service")} className={form.service ? "has-value" : ""} aria-invalid={!!errors.service}>
                <option value="" disabled hidden />
                {SERVICES.map((s) => (
                  <optgroup key={s.no} label={`${s.no} — ${s.subtitle}`}>
                    <option value={s.subtitle}>{s.subtitle} (genel danışmanlık)</option>
                    {s.items.map((it) => (
                      <option key={it.name} value={it.name}>{it.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field id="date" label="Tarih" forceFloat>
              <input id="date" name="date" type="date" min={today} placeholder=" " value={form.date} onChange={set("date")} />
            </Field>
            <Field id="time" label="Saat" forceFloat>
              <input id="time" name="time" type="time" min="09:30" max="20:30" step={900} placeholder=" " value={form.time} onChange={set("time")} />
            </Field>
            <Field id="note" label="Notunuz (isteğe bağlı)" className="md:col-span-2">
              <textarea id="note" name="note" rows={3} placeholder=" " value={form.note} onChange={set("note")} />
            </Field>

            <div className="bk-fade flex flex-col gap-5 pt-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <Magnetic strength={0.35}>
                <button type="submit" className="btn-aura btn-aura--solid !py-5 !pl-8 !pr-6" data-cursor="GÖNDER">
                  {sent ? "WhatsApp açılıyor…" : "Randevu Talebi Gönder"}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-noir/90 text-gold">
                    <WhatsApp className="h-4 w-4" />
                  </span>
                </button>
              </Magnetic>
              <p className="max-w-xs text-xs leading-relaxed text-bone/40" aria-live="polite">
                {sent
                  ? "Talebiniz WhatsApp’ta taslak olarak hazırlandı — göndermek için onaylamanız yeterli."
                  : "Bilgileriniz WhatsApp üzerinden doğrudan salonumuza taslak mesaj olarak iletilir."}
              </p>
            </div>
          </form>
        </div>

        {/* Contact */}
        <aside className="flex flex-col justify-between gap-14 lg:col-span-5 lg:col-start-8 lg:pt-40">
          <div className="space-y-10">
            <Info icon={<Pin className="h-5 w-5" />} label="Adres">
              <a href={SITE_CONFIG.mapsHref} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-2 hover:text-gold-light" data-cursor="YOL TARİFİ">
                {SITE_CONFIG.address}
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-gold transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </a>
            </Info>
            <Info icon={<Clock className="h-5 w-5" />} label="Çalışma Saatleri">
              <span className="text-gold-light">{SITE_CONFIG.hours}</span>
            </Info>
            <Info icon={<Phone className="h-5 w-5" />} label="Telefon">
              <a href={SITE_CONFIG.phoneHref} className="hover:text-gold-light" data-cursor="ARA">{SITE_CONFIG.phoneDisplay}</a>
            </Info>
          </div>

          <div className="bk-fade flex items-center gap-4">
            {[
              { href: `https://wa.me/${SITE_CONFIG.whatsapp}`, label: "WhatsApp", icon: <WhatsApp className="h-5 w-5" /> },
              { href: SITE_CONFIG.instagramUrl, label: "Instagram", icon: <Instagram className="h-5 w-5" /> },
              { href: SITE_CONFIG.phoneHref, label: "Telefon", icon: <Phone className="h-5 w-5" /> },
            ].map((s) => (
              <Magnetic key={s.label} strength={0.5}>
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 text-gold transition-all duration-500 hover:border-gold hover:bg-gold hover:text-noir hover:shadow-[0_0_30px_rgba(197,168,128,0.45)]"
                >
                  {s.icon}
                </a>
              </Magnetic>
            ))}
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="relative mx-auto mt-40 flex max-w-[1600px] flex-col items-center gap-6 border-t border-gold/10 px-5 py-10 text-[10px] uppercase tracking-[0.4em] text-bone/40 md:mt-64 md:flex-row md:justify-between md:px-12">
        <span>{SITE_CONFIG.full}</span>
        <span className="text-gold/70">The Grace 2026 • Design by Excellence</span>
        <button type="button" onClick={() => scrollToTarget(lenis, "#top")} className="group flex items-center gap-3 hover:text-gold-light" data-cursor="YUKARI">
          Başa Dön
          <ArrowUpRight className="h-4 w-4 -rotate-45 text-gold transition-transform duration-500 group-hover:-translate-y-1" />
        </button>
      </footer>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  className = "",
  forceFloat = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  forceFloat?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`bk-fade field ${forceFloat ? "field--float" : ""} ${className}`}>
      {children}
      <label htmlFor={id}>{label}</label>
      <span className="line" />
      {error && <span className="absolute -bottom-5 left-0 text-[11px] tracking-wide text-[#e0a39a]">{error}</span>}
    </div>
  );
}

function Info({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bk-fade flex gap-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/25 text-gold">{icon}</span>
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.45em] text-gold/70">{label}</p>
        <div className="font-serif text-xl leading-snug text-bone md:text-2xl">{children}</div>
      </div>
    </div>
  );
}
