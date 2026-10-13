# THE GRACE HAIR | BEAUTY — Cansu Üçdağ · Denizli

Denizli'deki THE GRACE salonu için sinematik, tek sayfalık landing page.

**Altyapı:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · GSAP 3 + ScrollTrigger (`@gsap/react`) · Lenis smooth scroll · `next/font` (Cinzel, Playfair Display, Manrope).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Yapı

| Dosya | Görev |
| --- | --- |
| `lib/content.ts` | Tüm metinler, hizmetler & fiyatlar, galeri görselleri, iletişim bilgileri |
| `components/providers/SmoothScroll.tsx` | Lenis ↔ GSAP ticker ↔ ScrollTrigger entegrasyonu |
| `components/Preloader.tsx` | Gold maskeli split-text, %000 sayaç, asimetrik çapraz kapı açılışı |
| `components/Navbar.tsx` | Kaydırınca küçülen glassmorphism bar, dönen gold kenarlı “Randevu Al” |
| `components/Hero.tsx` | Kelime reveal, mouse paralaks katmanları, dönen PRESTIGE rozeti |
| `components/Services.tsx` | Pin'lenen yatay scroll, kart içi paralaks, hover'da fiyat reveal |
| `components/Gallery.tsx` | Asimetrik mozaik, farklı hızlarda paralaks, sergi tarzı reveal + marquee |
| `components/Booking.tsx` | Animasyonlu input'lar, WhatsApp taslak mesajı, iletişim & footer |
| `components/Cursor.tsx` / `Magnetic.tsx` | Etiketli özel imleç (`data-cursor="KEŞFET"`) ve mıknatıs efekti |

## Düzenlenecekler

- `lib/content.ts` içindeki **fiyatlar örnektir** — salonun güncel fiyat listesiyle değiştirin.
- `SALON.instagram` şu an genel Instagram adresi — salonun hesabıyla değiştirin.
- Görseller Unsplash'ten geliyor; kendi fotoğraflarınızı `public/` altına koyup `lib/content.ts`'teki adresleri değiştirebilirsiniz. Bir görsel yüklenemezse çerçeve noir/gold bir gradyana döner.
- `prefers-reduced-motion` açık olan ziyaretçilerde smooth scroll ve scroll-jacking devre dışı kalır.

> Not: Kök dizindeki `index.html`, önceki “Maison de Beauté — Aura Salon” statik sayfasıdır ve Next.js uygulamasından bağımsızdır.
