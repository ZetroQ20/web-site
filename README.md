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

---

# ÜÇDAĞ — Kreatif & Dijital Ajans (`/ajans`)

Abdullah Üçdağ'ın Denizli merkezli ajansı için "Cinematic Dark Luxury" tek sayfa: `#050505` zemin, hareketli film greni, sıcak ışık sızıntıları, Instrument Serif başlıklar + Manrope gövde. Salon sitesi `/`'de aynen duruyor; ajans sitesi kendi root layout'u ile `/ajans` rotasında.

| Dosya | Görev |
| --- | --- |
| `lib/ajans-content.ts` | **Tüm metinler, hizmetler, projeler, e-posta / sosyal linkler, stüdyo ritmi verisi** — düzenlenecek tek dosya |
| `app/(ajans)/layout.tsx`, `ajans.css` | Root layout, fontlar, tema token'ları (shadcn `--color-*` değişkenleri dahil), gren / duman / buton stilleri |
| `components/ui/liquid-sculpture-hero.tsx` | WebGL2 sıvı parçacık heykel hero |
| `components/ui/contribution-skyline.tsx` | Isı haritasından 3B silüete dönüşen aktivite grafiği (Türkçe için eklenen `labels` prop'u dışında orijinal) |
| `components/ajans/AgencySite.tsx` | Sayfa iskeleti ve GSAP koreografisi: maskeli başlıklar, reveal, parallax, manifesto ışıklanması, hızla eğilen bant |
| `components/ajans/Preloader.tsx` | Açılış perdesi (harfler + 000→100 sayaç) |
| `components/ajans/Cursor.tsx` | `mix-blend-difference` imleç; `data-cursor="ETİKET"` ile büyüyüp yazı taşır |
| `components/ajans/SiteNav.tsx` | Difference navbar, manyetik linkler, aşağı kaydırınca gizlenir, mobil tam ekran menü |
| `components/ajans/Services.tsx` | Editoryal hizmet listesi + imleci takip eden görsel önizleme |
| `components/ajans/Work.tsx` | Üst üste binen asimetrik portfolyo, çerçeve içi parallax |
| `components/ajans/Rhythm.tsx` | Stüdyo ritmi (ContributionSkyline) |
| `components/ajans/Finale.tsx` | Dev "Let's Talk." + manyetik yuvarlak buton + minimal footer |

**Düzenlenecekler:** `STUDIO.email`, `SOCIALS`, projelerin `href` ve görselleri (`PROJECTS`) yer tutucu. `ACTIVITY.data` boşken Skyline **örnek veri** gösterir ("Örnek veri" etiketiyle); yayından önce gerçek günlük sayılarla doldurun.

### Tek dosya sürümü: `ajans/index.html`

`npm run build:standalone` ile üretilir: Next'in prerender ettiği `/ajans` HTML'i + derlenmiş CSS (fontlar gömülü) + `scripts/standalone/behaviour.js` (aynı hareketlerin vanilla JS hâli; GSAP, Lenis ve React 18 CDN'den). Çift tıklayıp açılabilir veya herhangi bir statik hostinge yüklenebilir. Siteyi değiştirdikten sonra bu komutu yeniden çalıştırın; dosyayı elle düzenlemeyin.

shadcn yapısı: `components.json`, `lib/utils.ts` (`cn`), `components/ui/`.
