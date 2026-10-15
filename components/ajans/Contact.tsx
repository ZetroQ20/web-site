"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Mail, Phone } from "lucide-react";
import { BUDGETS, INTERESTS, SOCIALS, STUDIO } from "@/lib/ajans-content";
import { cn } from "@/lib/utils";

/**
 * No backend yet: the form validates in place, then opens the visitor's mail app
 * with a pre-filled brief addressed to STUDIO.email.
 */
export default function Contact() {
  const [interests, setInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const toggle = (v: string) => setInterests((xs) => (xs.includes(v) ? xs.filter((x) => x !== v) : [...xs, v]));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const next: Record<string, string> = {};
    if (!name) next.name = "Adınızı yazın.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Geçerli bir e-posta adresi girin.";
    if (message.length < 10) next.message = "Projenizden birkaç cümleyle bahsedin.";
    setErrors(next);
    if (Object.keys(next).length) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }
    const body = [
      `Ad: ${name}`,
      `E-posta: ${email}`,
      interests.length ? `İlgi alanı: ${interests.join(", ")}` : "",
      budget ? `Bütçe: ${budget}` : "",
      "",
      message,
    ]
      .filter((l, i) => l || i === 4)
      .join("\n");
    window.location.href = `mailto:${STUDIO.email}?subject=${encodeURIComponent(`Yeni proje — ${name}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const chip = (active: boolean) =>
    cn(
      "min-h-11 rounded-full border px-4 text-sm transition-colors duration-200",
      active ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink/85 hover:border-ink/50"
    );

  return (
    <section id="iletisim" aria-labelledby="iletisim-baslik" className="relative overflow-hidden px-5 pb-10 pt-28 sm:px-8 md:pt-40">
      <div className="relative mx-auto max-w-[1400px]">
        <p data-reveal className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-mist">
          <span className="h-px w-8 bg-ink/50" /> İletişim
        </p>
        <h2
          id="iletisim-baslik"
          data-reveal
          className="font-display text-[clamp(3.4rem,12.5vw,13rem)] font-medium leading-[0.86] tracking-[-0.045em]"
        >
          Projeye <br />
          <span className="font-serif font-normal italic tracking-[-0.02em]">Başlayalım.</span>
        </h2>

        <div className="mt-20 grid gap-16 md:grid-cols-12">
          <form noValidate onSubmit={onSubmit} data-reveal className="glass rounded-[28px] p-6 sm:p-10 md:col-span-7" aria-describedby="form-not">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="field">
                <input id="name" name="name" type="text" autoComplete="name" placeholder=" " aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
                <label htmlFor="name">Adınız</label>
                {errors.name && <p id="name-err" className="mt-2 text-sm text-[#b42318]">{errors.name}</p>}
              </div>
              <div className="field">
                <input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder=" " aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} />
                <label htmlFor="email">E-posta</label>
                {errors.email && <p id="email-err" className="mt-2 text-sm text-[#b42318]">{errors.email}</p>}
              </div>
            </div>

            <fieldset className="mt-10">
              <legend className="mb-4 text-sm text-mist">Neye ihtiyacınız var?</legend>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((v) => (
                  <button key={v} type="button" aria-pressed={interests.includes(v)} onClick={() => toggle(v)} className={chip(interests.includes(v))}>
                    {v}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-8">
              <legend className="mb-4 text-sm text-mist">Tahmini bütçe</legend>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((v) => (
                  <button key={v} type="button" aria-pressed={budget === v} onClick={() => setBudget(budget === v ? "" : v)} className={chip(budget === v)}>
                    {v}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="field mt-8">
              <textarea id="message" name="message" rows={4} placeholder=" " aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-err" : undefined} />
              <label htmlFor="message">Projenizden bahsedin</label>
              {errors.message && <p id="message-err" className="mt-2 text-sm text-[#b42318]">{errors.message}</p>}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <button type="submit" className="btn-fill btn-fill--solid" data-cursor="GÖNDER">
                {sent ? <Check size={18} aria-hidden /> : null}
                {sent ? "E-posta uygulamanız açıldı" : "Gönder"}
                {!sent && <ArrowUpRight size={18} aria-hidden />}
              </button>
              <p id="form-not" className="text-sm text-mist">
                Gönder, e-posta uygulamanızı hazır bir taslakla açar.
              </p>
            </div>
            <p role="status" aria-live="polite" className="sr-only">
              {sent ? "E-posta taslağınız hazırlandı." : ""}
            </p>
          </form>

          <aside data-reveal className="flex flex-col gap-10 md:col-span-4 md:col-start-9">
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] text-mist">Doğrudan</h3>
              <a href={`mailto:${STUDIO.email}`} className="link-draw mt-4 inline-flex items-center gap-3 font-display text-2xl font-medium">
                <Mail size={22} className="text-mist" aria-hidden /> {STUDIO.email}
              </a>
              <a href={STUDIO.phoneHref} className="link-draw mt-3 inline-flex items-center gap-3 text-lg text-ink/85">
                <Phone size={18} className="text-mist" aria-hidden /> {STUDIO.phoneDisplay}
              </a>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] text-mist">Sosyal</h3>
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="btn-fill w-full !justify-between">
                      {s.label} <ArrowUpRight size={16} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] text-mist">Stüdyo</h3>
              <p className="mt-4 text-lg leading-relaxed text-ink/85">
                {STUDIO.city}, Türkiye
                <br />
                <span className="text-mist">Dünyanın her yerine uzaktan hizmet.</span>
              </p>
            </div>
          </aside>
        </div>

        <footer className="mt-28 flex flex-col gap-6 border-t border-ink/10 pt-8 text-sm text-mist md:flex-row md:items-center md:justify-between">
          <span className="font-display text-base font-medium text-ink">{STUDIO.mark}</span>
          <span>
            © {new Date().getFullYear()} {STUDIO.name} — {STUDIO.tagline}. Tüm hakları saklıdır.
          </span>
          <a href="#top" className="link-draw self-start text-ink md:self-auto">
            Başa dön ↑
          </a>
        </footer>
      </div>
    </section>
  );
}
