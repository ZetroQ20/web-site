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
| `components/Services.tsx` | VIP dikey kart destesi: sahne tek seferde pin'lenir, tek bir scrub'lı timeline her kartı bekletir (`HOLD`) ve bir sonrakini iskambil gibi üstüne kapatır (`COVER`); tempo bu sabitlerden ayarlanır |
| `components/services/ServiceMedia.tsx` | Her hizmetin altın oran (1:1.618) çerçevesi ve sahne katmanları |
| `components/services/effects.ts` | Hizmete özel GSAP sahneleri: ipek dalga (saç), ışıltı açılımı (cilt bakımı), lazer tarama (lazer), altın oran kılavuzları (estetik), ışık yansıması (nail art) |
| `components/Gallery.tsx` | Asimetrik mozaik, farklı hızlarda paralaks, sergi tarzı reveal + marquee |
| `components/RitualBuilderModal.tsx` | Ritüel Oluşturucu: çoklu hizmet seçimi, anlık tutar/süre, gün + saat aralığı, WhatsApp onayı (`useRitual().open()`) |
| `components/FounderVision.tsx` | Kurucu & vizyon manifestosu (portre `FOUNDER.portrait` boşken monogram gösterir) |
| `components/Testimonials.tsx` | Müşteri yorumları — yalnızca `REVIEWS` içindeki gerçek yorumlarla görünür |
| `components/BeforeAfterSlider.tsx` | Öncesi/sonrası karşılaştırma (fare, dokunma, klavye) — `BEFORE_AFTER` fotoğrafları eklenince görünür |
| `components/JsonLd.tsx` | Yerel SEO: HairSalon + BeautySalon structured data |
| `components/Booking.tsx` | Animasyonlu input'lar, WhatsApp taslak mesajı, iletişim & footer |
| `components/Cursor.tsx` / `Magnetic.tsx` | Etiketli özel imleç (`data-cursor="KEŞFET"`) ve mıknatıs efekti |

## Düzenlenecekler

- **Önizleme:** Henüz içerik bekleyen bölümleri (öncesi/sonrası, yorumlar) örnek verilerle görmek için adrese `?onizleme` ekleyin. Normal ziyaretçiler örnekleri görmez.
- `FOUNDER.portrait`, `BEFORE_AFTER` ve `REVIEWS` (`lib/content.ts`): gerçek portre, öncesi/sonrası fotoğrafları ve gerçek müşteri yorumları/puanı.
- `SITE_CONFIG.openDays` (açık günler) ve `SITE_CONFIG.instagramUrl`.

- `lib/content.ts` içindeki **fiyatlar ve süreler örnektir** — salonun güncel fiyat listesiyle değiştirin.
- Görseller Unsplash'ten geliyor; kendi fotoğraflarınızı `public/` altına koyup `lib/content.ts`'teki adresleri değiştirebilirsiniz. Bir görsel yüklenemezse çerçeve noir/gold bir gradyana döner.
- `prefers-reduced-motion` açık olan ziyaretçilerde smooth scroll, kart pin'leme ve sahne efektleri devre dışı kalır; görseller son hâlleriyle gösterilir.

> Not: Kök dizindeki `index.html`, önceki “Maison de Beauté — Aura Salon” statik sayfasıdır ve Next.js uygulamasından bağımsızdır.
