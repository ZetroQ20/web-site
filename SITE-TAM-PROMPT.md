Sen üst düzey bir kreatif geliştirici ve dijital ürün tasarımcısısın (Awwwards "Site of the Day" seviyesinde iş çıkaran biri). Elimde Abdullah Üçdağ'ın (Denizli, web tasarım) sitesi var: index.html. Koyu tema, turkuaz vurgu (#3DF2E0), Unbounded + Geist + Geist Mono fontları, arka planda WebGL2 ile çizilen 3B arazi ızgarası, kaydırmaya bağlı numaralı bölümler ([00]–[09]) var. Sitede ayrıca yatay kaydırmalı bir portfolyo bölümü ("[05] İşler") bulunuyor: kartlar yan yana duruyor, tıklanan kart ortaya kayıyor, sağda bilgi paneli (proje adı, sektör, şehir, etiketler, yıl, ← → okları, "Siteyi gör" butonu), altta numaralı küçük gezinme düğmeleri var.

Bu görevde ÜÇ şey yapacaksın:
  1) Sitedeki tüm görsel ve teknik hataları düzelteceksin (BÖLÜM 1).
  2) Siteyi "VIP / lüks / 10.000 $'lık stüdyo sitesi" seviyesine çıkaracaksın (BÖLÜM 2–4).
  3) Portfolyo bölümünü "Sektör örnekleri"ne çevirip, sitenin İÇİNDE gezilebilen, birbirinden tamamen farklı 6 örnek site tasarlayıp kodlayacaksın (BÖLÜM 6–8).
Örnek siteler gerçek müşteri işi DEĞİL; yayınlanmamış örnek tasarımlar. Ziyaretçi "benim işletmemin sitesi böyle olabilir" diye fikir edinsin diye var.

======================================================================
0. ÇALIŞMA KURALLARI (önce bunu oku)
======================================================================
1. Kod yazmadan önce index.html'in TAMAMINI oku: CSS, HTML, JS, WebGL shader ve portfolyo bölümünün mevcut kodu. Mevcut sınıf adlarını, renk değişkenlerini, easing'i (cubic-bezier(.16,1,.3,1)), data-sec / data-col / data-r / data-scr / .mag / .vel gibi mekanikleri ve kaydırma (pin) sistemini anla.
2. Bana kısa bir plan yaz (hangi dosyalar oluşacak, hangi bölümde ne değişecek), sonra uygula.
3. İş büyük; şu AŞAMALARLA ilerle ve her aşamanın sonunda sayfayı açıp konsolda hata olmadığını, hiçbir şeyin bozulmadığını kontrol et:
     Aşama 1: BÖLÜM 1 (hatalar)
     Aşama 2: BÖLÜM 2 ve 3 (VIP tasarım dili ve bölüm dokunuşları)
     Aşama 3: BÖLÜM 6 (portfolyo bölümü ve tarayıcı modu)
     Aşama 4: BÖLÜM 7 (6 örnek site, her biri ayrı ayrı)
     Aşama 5: BÖLÜM 4 ve 8 (teknik kalite, performans), ardından BÖLÜM 9'daki kabul testleri
   Bir aşama bitmeden diğerine geçme.
4. Değiştirmeyeceklerin:
   - Telefon numarası (0553 190 45 11, tel:+905531904511), WhatsApp linkleri (wa.me/905531904511), isim, şehir.
   - Bölümlerin sırası ve metinlerin anlamı (metinleri sadece bu promptta istenen yerlerde sadeleştir).
   - Turkuaz (#3DF2E0) markanın imza rengi olarak kalacak.
5. Harici JS kütüphanesi EKLEME (GSAP, Three.js, Lenis, Swiper vb. yok). Vanilla JS + CSS + mevcut WebGL2 kullan. Fontlar sadece Google Fonts'tan.
6. Dosya yapısı:
     index.html                    (ana site; kendi CSS/JS'i içinde, tek dosya kalacak)
     ornekler/restoran.html
     ornekler/klinik.html
     ornekler/tekstil.html
     ornekler/otel.html
     ornekler/oto-servis.html
     ornekler/kuafor.html
   Her örnek site TEK BAŞINA çalışan, kendi CSS ve JS'i içinde olan tek bir HTML dosyası olsun. Ortak dosya yok.
7. Test için dosyaları file:// ile değil, yerel bir sunucuyla aç (python3 -m http.server 8080). iframe iletişimi bunu gerektirir.

======================================================================
1. KESİN DÜZELTİLECEK HATALAR (ölçülmüş, gerçek hatalar)
======================================================================
1.1 Taşan dev "ÜÇDAĞ" yazıları
   - [01] Geçit bölümündeki .z-word (font-size: 24vw, white-space: nowrap): 1440 px'te sol -42 px / sağ 1482 px, 390 px'te sol -11 px / sağ 401 px; yani her ekranda iki yandan ekran dışına taşıyor. Çözüm: font-size'ı clamp() ile ekrana sığdır (örn. clamp(72px, 19vw, 300px)), letter-spacing'i -0.04em'e çek, kelimenin gerçek genişliğini JS ile ölçüp (getBoundingClientRect) ekran genişliğinin %92'sini aşmayacak şekilde ölçekle. Zoom animasyonu (--z ölçeği) sırasında taşma kasıtlı olabilir, ama BAŞLANGIÇ durumunda kelime tamamen ekranın içinde ve ortalanmış olmalı.
   - Footer'daki .mark (font-size: 25vw, margin-left: -1vw): ekranın tamamını kaplıyor ve soldan taşıyor; kaba ve "ucuz" görünüyor. Çözüm: yaklaşık 16–18vw'ye indir, ortala, margin-left negatifini kaldır, kenarlarda en az 4vw boşluk kalsın. Kontur rengi çok hafif kalsın (rgba(232,241,240,.10)), kaydırmayla veya imleçle dolsun (bkz. 3.12).
   - Yükleme ekranındaki sayaç (.boot b, clamp(64px,12vw,180px)) küçük ekranlarda kenara yapışıyor; kenar boşluğu bırak.
1.2 Hero başlığı
   - "gelen web" satırı (.h-l2): satır kutusu 1440 px'te 1495 px'e uzanıyor, yani ekrandan taşıyor. 1024 px'te de taşıyor. Başlık hiçbir genişlikte (360–1920 px) yatay taşmamalı. h1 font-size'ını clamp() ile yeniden ayarla; satır girintisini (padding/margin) vw yerine em ile ver.
1.3 Mobilde telefon numarası kırılıyor
   - Footer'daki .tel (clamp(44px,9.6vw,164px)) 390 px'te "0553 190 45" + alt satırda "11" olarak bölünüyor. white-space: nowrap ver ve font-size'ı numara tek satıra sığacak şekilde hesapla (390 px'te ~34–36 px civarı). ::before/::after glitch katmanları da aynı satırda kalsın.
1.4 Sabit header içerikle çakışıyor
   - .hud'un zemini yok; logo, bölüm etiketlerinin ("[03] Hizmet modülleri"), süreç adımlarının ve mobilde kartların üstüne biniyor. Kaydırma > 40 px olunca header'a yarı saydam koyu zemin + backdrop-filter: blur(14px) saturate(140%) + alttan 1 px ince çizgi ekle (yumuşak geçişle). Pinlenen bölümlerin üst içeriği header yüksekliği + 24 px'ten aşağıda başlasın.
1.5 Pikselli WebGL arka plan
   - sizeGL() içinde render ölçeği en fazla 0.75 ve sabit bir piksel bütçesi var. Bu yüzden ızgara çizgileri merdiven gibi tırtıklı. Masaüstünde ölçeği 1.0'a (DPR ≥ 2 ekranlarda en fazla 1.25) çıkar. Shader'da ızgara çizgilerini fwidth() + smoothstep() ile kenar yumuşatmalı (anti-aliased) çiz. Dinamik kalite ekle: son 60 karenin ortalaması 50 FPS'in altına düşerse ölçeği 0.1'lik adımlarla 0.6'ya kadar indir, 58'in üstünde kalırsa geri yükselt.
1.6 Okunabilirlik
   - Izgara üstündeki metinler (süreç açıklamaları, simülatör açıklaması, sektörler paragrafı) kayboluyor. Metin bloklarının arkasına çok yumuşak, kenarları görünmeyen bir radyal karartma ekle (kutu gibi görünmesin).
   - Süreç bölümündeki pasif adımların opaklığı .38; bunu .5 yap ve başlıkları değil, sadece açıklamayı soluk bırak.
   - Hiçbir gövde metni 15 px'in, hiçbir etiket 11 px'in altında olmasın. Metin kontrastı en az 4.5:1 olsun.
1.7 Yükleme ekranı
   - Sayaç gerçek yüklemeye bağlı değil (setInterval ile rastgele artıyor, ~1,5 sn bekletiyor). document.fonts.ready + WebGL'in ilk karesine bağla; en fazla 900 ms sürsün. Aynı oturumda ikinci ziyarette (sessionStorage) gösterme.
1.8 Genel taşma kuralı
   - 360, 390, 768, 1024, 1280, 1440 ve 1920 px genişliklerde document.documentElement.scrollWidth === innerWidth olmalı. Hiçbir metin öğesi (yatay kayan kart şeritleri ve 3B silindir hariç) ekranın dışına çıkmamalı.

======================================================================
2. VIP / LÜKS YÖN: genel tasarım dili
======================================================================
Hedef: şu anki "sci-fi HUD" hissini koru ama onu "pahalı, sakin, kendinden emin" bir hale getir. Lüks = az ama kusursuz. Her şeyin nefes alacak alanı olsun, hiçbir şey bağırmasın.

2.1 Renk
   - Zemin: saf siyaha yakın, hafif soğuk ton (#050608). Bölümler arasında çok hafif ton farkı (#07090C / #0A0C10).
   - Metin: kırık beyaz / fildişi (#ECEFEA); ikincil metin #9AA5A3.
   - Turkuaz (#3DF2E0) artık az ve değerli kullanılsın: sadece birincil CTA, aktif durumlar, ince vurgu çizgileri. Büyük alanları turkuaza boyama.
   - İkinci vurgu: mevcut --sig (#FF5A1F) yerine daha lüks bir sıcak ton tanımla: şampanya/altın (#D8B98A). Bunu sadece çok küçük detaylarda kullan (sayaç numaraları, ince ayırıcılar, "seçkin" rozetler). Turkuaz ve altın aynı öğede asla birlikte kullanılmasın.
   - Tüm renkleri :root üzerinde CSS değişkeni (token) olarak tanımla; bileşenlerde ham hex kullanma.

2.2 Tipografi
   - Başlıklar Unbounded kalabilir ama 900 ağırlığını kaldır; 500–700 kullan. Dev başlıklarda letter-spacing -0.035em, line-height 0.95.
   - Editoryal bir serif ekle: "Instrument Serif" (italik dahil, Google Fonts). Başlıklardaki vurgulu kelimeleri bu italik serifle yaz. Örnek: hero'daki konturlu "gelen" kelimesi → Instrument Serif italik, normal dolgu, hafif altın-turkuaz degrade. "Siteniz, işletmenizin geleceğe açılan kapısı." içindeki "geleceğe açılan" ve diğer bölüm başlıklarındaki birer vurgu kelimesi de aynı stilde. Bu karışım (geometrik sans + italik serif) lüks hissin ana kaynağı olacak.
   - Gövde: Geist 400, 17–18 px, line-height 1.6, satır uzunluğu en fazla 62 karakter.
   - Mono etiketler (Geist Mono, büyük harf): sayılarını yarıya indir. Sadece bölüm numaraları ("[03]") ve gerçekten bilgi taşıyanlar kalsın. "Aktif" rozetleri, "Kaydır — dünya dijitale taranır", "Gökyüzü / Denizli · canlı", "İmleçle araziyi tara", "Yaklaşma x07.4" gibi süs etiketlerini kaldır ya da tek ve sade bir etikete indir. Kalan etiketlerde letter-spacing .18em, font-size 11–12 px, renk ikincil metin.
   - Font yüklemesini optimize et: Unbounded'dan sadece 2 ağırlık (500, 700), Geist'ten 3 (400, 500, 600), Geist Mono'dan 1 (400), Instrument Serif normal + italik. Kritik fontlar için <link rel="preload">, font-display: swap.

2.3 Boşluk ve ızgara
   - 8 px tabanlı boşluk ölçeği tanımla (--s-1 … --s-12). Bölümler arası dikey boşluk masaüstünde en az 160 px, mobilde 96 px.
   - 12 kolonlu ızgara; içerik kenar boşluğu masaüstünde 56–72 px, mobilde 20 px.
   - Kalıp tekrarını kır: her bölüm "küçük etiket + dev başlık + ızgara" şeklinde olmasın. Bazı bölümlerde başlık sağa hizalı, bazılarında ortalanmış, birinde (Neden bölümü) başlıksız büyük bir alıntı olsun.

2.4 Doku ve ışık
   - Tüm sayfaya çok hafif animasyonlu film greni (SVG feTurbulence, opacity .035, mix-blend-mode: overlay, pointer-events: none). Hareketi 8 fps gibi düşük kare hızında yap.
   - Kartlarda ve panellerde: 1 px iç kenarlık (rgba(255,255,255,.06)), üstten çok hafif ışık degradesi, imleci takip eden yumuşak spot ışık (radial-gradient + CSS değişkenleri --mx/--my).
   - Gölgeler sert değil; geniş, düşük opaklıklı, katmanlı.

2.5 Hareket
   - Tek bir hareket dili tanımla: ana easing cubic-bezier(.16,1,.3,1); süreler: mikro etkileşim 180–240 ms, öğe girişi 700–900 ms, bölüm geçişi 1100–1300 ms.
   - Metin girişleri: satır satır maskeyle aşağıdan yukarı (clip-path), 60–80 ms gecikmeli. Kelime kelime değil, satır satır (daha sakin, daha lüks).
   - Kaydırma: hafif yumuşatılmış kaydırma (kendi küçük lerp tabanlı uygulaman, yerel kaydırmayı bozmadan; dokunmatik cihazlarda kapalı).
   - Hiçbir şey hızlı yanıp sönmesin. Glitch efektlerini (.tel:hover) daha zarif bir şeye çevir: numaranın üzerinden geçen ince ışık süzmesi (shine).

======================================================================
3. BÖLÜM BÖLÜM VIP DOKUNUŞLAR
======================================================================
3.1 Header (.hud)
   - Sol: logo + "ÜÇDAĞ" (Unbounded 600, letter-spacing .08em). Orta: masaüstünde sade menü: Örnekler · Hizmetler · Süreç · SSS · İletişim (yumuşak kaydırmayla ilgili bölüme gitsin, aktif bölüm altında ince turkuaz çizgi). Mobilde menü → sağda "Menü" butonu → tam ekran, büyük serif linklerle açılan perde menü (açılış 600 ms, linkler sırayla gelsin, Esc ile kapansın, odak menü içinde kalsın).
   - Sağ: "Ara" butonu. Masaüstünde (pointer: fine) tel: linki işe yaramadığı için tıklayınca numarayı panoya kopyalasın ve küçük zarif bir toast göstersin ("Numara kopyalandı"); mobilde arama yapsın.
   - Yüzde göstergesini ("026%") kaldır; yerine header'ın altında 1 px'lik ince ilerleme çizgisi.

3.2 Yükleme ekranı
   - Logo SVG'si çizgi çizgi çizilsin (stroke-dashoffset), ardından "ÜÇDAĞ" harfleri tek tek belirsin, sonra perde yukarı kalksın ve hero başlığı satır satır gelsin. Toplam en fazla 1,6 sn (ilk ziyaret).

3.3 Hero
   - Başlık: "Gelecekten / gelen web / siteleri." — "gelen" Instrument Serif italik. Boyut: clamp(48px, 8.4vw, 150px); 360–1920 px arası hiç taşmayacak.
   - Köşe bilgilerini (koordinat, saat) tek ince satıra indir, daha küçük ve soluk.
   - CTA'lar: birincil buton turkuaz dolgulu, ikincil buton ince kenarlıklı; ikisinde de manyetik efekt (mevcut .mag) daha yumuşak (en fazla 8 px çekim), hover'da içte sağa kayan ok.
   - Altta ortada zarif bir "kaydır" göstergesi: ince dikey çizgi içinde aşağı akan küçük nokta.

3.4 [01] Geçit (zoom)
   - "ÜÇDAĞ" kelimesi başlangıçta tamamen ekranın içinde (bkz. 1.1). Kaydırdıkça kelime büyür ve "D" harfinin içinden geçilir (mevcut fikir); geçiş sırasında hafif kromatik sapma ve bulanıklıkla sinematik bir "kapıdan geçiş" hissi ver.
   - Geçişten sonra "Siteniz, işletmenizin geleceğe açılan kapısı." başlığı ortada, serif vurgulu olarak belirsin.

3.5 [02] Yaklaşım
   - Kelime kelime belirme yerine: büyük, ortalanmış, editoryal paragraf; kaydırdıkça soluk metin satır satır tam beyaza dolsun (okuma ilerlemesi hissi). Paragrafın içinde 2–3 anahtar ifade italik serif.

3.6 [03] Hizmetler (yatay kart şeridi)
   - Kartlar: daha geniş iç boşluk (40 px), büyük konturlu numara (01–05) çok daha ince ve soluk, üstte ince çizgi ikon (her hizmet için özel, 1.5 px stroke, 28 px).
   - "Aktif" rozetlerini kaldır.
   - İmleçle hafif 3B eğilme (en fazla 5°, perspective 1200 px) + kenarda imleci takip eden ışık.
   - Altta ilerleme çubuğu ince ve zarif; "01 / 05" sayacında rakamlar yuvarlanarak değişsin.
   - Mobilde pin/scroll-jacking yerine native yatay kaydırma + scroll-snap.

3.7 [04] Süreç
   - Önizleme penceresi her adımda gerçekten bir siteye dönüşsün: Keşif → boş tel kafes çizgileri; Tasarım → renk paleti ve yazı tipi örnekleri yerine oturur; Kod → gerçek başlık, metin ve butonlar belirir; Yayın → fotoğraf alanı dolar, "Yayında" rozeti yeşil yanar, adres çubuğunda kilit ikonu çıkar.
   - Terminal satırları daktilo efektiyle yazılsın (imleç yanıp söner).

3.8 [05] Örnekler (portfolyo)
   - Bu bölümün tamamı BÖLÜM 6'da ayrıntılı olarak tanımlandı; orayı uygula.

3.9 [06] Simülatör
   - Önizleme sektöre göre sadece renk değil; yazı tipi eşleşmesi, düzen (hero solda/ortada), buton şekli ve dekoratif öğe değiştirsin. Değişim 500 ms'lik çapraz geçişle olsun.
   - İşletme adı yazılırken önizlemede harf harf canlı güncellensin.
   - "Bu taslağı WhatsApp'tan gönder" butonu birincil CTA stiliyle, altında küçük güven metni.

3.10 [07] Sektörler (3B silindir) ve [08] Neden
   - Silindirdeki kelimeler: aktif kelime dolu beyaz, diğerleri ince kontur; uzaklaştıkça bulanıklaşsın (derinlik).
   - Neden bölümü: üç kart yerine solda büyük italik serif bir alıntı ("Aradığınızda ben açarım."), sağda üç madde ince çizgilerle ayrılmış. Daha editoryal, daha sakin.

3.11 [09] SSS
   - Akordeon: açılırken yükseklik yumuşak animasyonlu (grid-template-rows 0fr → 1fr), "+" ikonu "−"ye dönerek dönüşsün. Aynı anda tek bir soru açık kalsın.

3.12 Footer / İletişim
   - Büyük telefon numarası tek satır (bkz. 1.3), hover'da üzerinden ince ışık süzmesi geçsin.
   - Dev "ÜÇDAĞ" (.mark) ekranın içinde, ortalanmış (bkz. 1.1). Kaydırma ilerledikçe konturdan soldan sağa dolguya geçsin; masaüstünde imleci takip eden yumuşak bir ışık maskesi kelimeyi lokal olarak aydınlatsın.
   - En altta ince çizgiyle ayrılmış alt satır: "© 2026 Abdullah Üçdağ · Denizli" solda, "Başa dön ↑" sağda.

3.13 Özel imleç (sadece pointer: fine)
   - Küçük nokta + gecikmeli takip eden ince halka. Link/buton üstünde halka büyüsün; proje kartında "Görüntüle" etiketi; metin giriş alanında normal imlece dönsün.

======================================================================
4. TEKNİK KALİTE (VIP site teknik olarak da kusursuz olmalı)
======================================================================
- <head>: Open Graph ve Twitter kart etiketleri (başlık, açıklama, 1200×630 görsel için yer tutucu), inline SVG favicon (logodan), theme-color #050608, canonical yer tutucusu.
- JSON-LD ile LocalBusiness / ProfessionalService şeması (isim, telefon, Denizli, hizmet alanı).
- Erişilebilirlik: tüm etkileşimli öğeler klavyeyle kullanılabilir, :focus-visible halkası net (turkuaz, 2 px, offset 3 px), tıklama alanları en az 44×44 px, dekoratif öğelerde aria-hidden, portfolyo şeridinde role="region" aria-roledescription="carousel" ve her slaytta aria-label="3 / 5: Ege Diş Kliniği". Başlık hiyerarşisi tek h1, sonra h2/h3.
- prefers-reduced-motion: reduce açıkken yükleme ekranı, pin/scroll-jacking, eğilme, otomatik kayma, gren animasyonu ve yumuşak kaydırma kapansın; içerik doğrudan görünsün. WebGL tek kare çizip dursun.
- Performans: WebGL render döngüsü sekme görünmezken (visibilitychange) ve canvas görünür olmadığında dursun. Mobilde (pointer: coarse veya genişlik < 768) render ölçeği 0.5 ile sınırlı, FPS hedefi 30. WebGL2 yoksa mevcut .nogl yedeği zarif bir degrade olarak çalışsın.
- Animasyonlarda sadece transform ve opacity kullan; width/height/top/left animasyonu yok. Layout shift (CLS) olmasın.
- Konsolda hiç hata veya uyarı olmasın.

======================================================================
5. (BÖLÜM 6–8 İÇİN NOT)
======================================================================
Buradan sonraki bölümler portfolyo ve örnek siteler içindir. BÖLÜM 2'deki VIP tasarım dili ana site (index.html) içindir; örnek sitelerin her biri BÖLÜM 7'de tanımlanan kendi tasarım diline sahip olacak.

======================================================================
6. PORTFOLYO BÖLÜMÜ: DÜZELTMELER VE YENİ KONSEPT
======================================================================
6.1 Mevcut hatalar (ekran görüntüsünde tespit edildi, hepsini düzelt)
  - Önizleme penceresindeki "Üzerine gel · sayfayı kaydır" ipucu, gri bir iskelet çubuğunun altında kalıyor ve onunla üst üste biniyor. İpucu ayrı bir katmanda, önizlemenin alt ortasında, yarı saydam koyu bir hap (pill) içinde dursun; içerikle asla çakışmasın; kullanıcı bir kez etkileşime girince kaybolsun.
  - Önizlemenin içindeki "45 Dk Ekspres · Garantili Parça · 7/24 Yol Yardım" satırında son öğe pencerenin sağ kenarına dayanıp kesiliyor. Önizleme içeriği hiçbir yerde pencere kenarından taşmamalı (overflow: hidden ve doğru iç boşluk).
  - Önizlemenin üst kısmındaki "Aracınızın plakasını ve bakım tipini seçin…" satırı adres çubuğunun hemen altında kesilmiş görünüyor. Önizleme her zaman içeriğin en üstünden (sitenin header'ından) başlasın.
  - "Siteyi gör" butonu iki yerde var (önizlemenin içinde ve bilgi panelinde). Önizlemenin içindekini kaldır. Bilgi panelinde tek bir birincil buton kalsın: "Siteyi gez ↗".
  - Önizlemenin solunda, içi boş, büyük ve garip bir daire/yay çizgisi var. Özel imleç halkası ya da dekoratif bir öğe yanlış yerde kalıyorsa kaldır.
  - Yandaki (pasif) kartlar neredeyse görünmüyor; ziyaretçi şeritte başka kart olduğunu anlamıyor. Pasif kartlar: scale(.86), opacity .45, hafif blur(1.5px), üzerlerinde sektör adı okunabilir olsun. Kenarlardaki kartlar ekran kenarına doğru yumuşak bir maske (mask-image: linear-gradient) ile kaybolsun.
  - Önizleme penceresi ile bilgi paneli dikeyde ortalı ve aynı hizada olsun; önizleme bilgi panelinden belirgin şekilde büyük olsun (masaüstünde yaklaşık 7/12 – 5/12 oran).
  - Alt gezinme düğmeleri (01–05): yerine sektör adı yazan ince hap düğmeler gelsin ("Restoran", "Klinik"…); aktif olan dolu, diğerleri ince kenarlıklı. Mobilde yatay kaydırılabilir tek satır.

6.2 Yeni konsept: "Sektör örnekleri"
  - Bölüm etiketi: "[05] Örnekler". Başlık: "Sizin siteniz böyle olabilir." ("böyle olabilir" vurgulu; varsa italik serif).
  - Sağdaki açıklama: "Her sektör için sıfırdan tasarladığım örnek siteler. Birini seçin, içine girin ve gerçek bir site gibi gezin."
  - Bilgi panelinde yıl yerine küçük bir "Örnek tasarım" rozeti olsun. Ziyaretçiyi yanıltacak "müşterim", "yaptığım iş" gibi ifadeler kullanma.
  - Kart sayısı 6 (BÖLÜM 7'deki sektörler). Bilgi panelinde: site adı, sektör, "Denizli", 4 etiket (o sitenin öne çıkan özellikleri), ← → okları, "Siteyi gez ↗" butonu.
  - Aktif projenin ana rengi (accent) CSS değişkeniyle (--pa) bölümdeki vurgulara ve arka plandaki WebGL ızgarasının rengine 1,2 sn'de yumuşakça yansısın (mevcut renk mekanizmasını kullan).

6.3 Kart önizlemeleri (canlı, ama hafif)
  - Aktif kartın önizlemesi o örnek sitenin KENDİSİ olsun: kartın içinde iframe ile ornekler/<sektor>.html yüklensin, 1280 px genişlikte render edilip transform: scale() ile kart genişliğine küçültülsün. pointer-events: none (kartta tıklama kartın kendisine gitsin).
  - Aktif kartın üzerine gelince önizleme otomatik olarak yavaşça aşağı kaysın (yaklaşık 8 sn'de sayfanın sonuna). Bunu iframe'e postMessage ile {type:'autoscroll', on:true/false} göndererek yap; örnek site bu mesajı alınca kendi içinde yumuşak kaydırma yapsın (7.0'a bak). İmleç çıkınca 600 ms'de başa dönsün.
  - Pasif kartlarda iframe YÜKLEME: bunun yerine CSS ile çizilmiş hafif bir "poster" göster (o sitenin renkleri, logosu, büyük başlığı). Aynı anda en fazla 1 önizleme iframe'i ve 1 tam ekran iframe'i yaşasın. Kart pasifleşince iframe'i kaldır (src="about:blank" ve DOM'dan çıkar).
  - iframe yüklenirken poster görünsün, yüklenince 300 ms çapraz geçişle önizlemeye dönsün.
  - Aktif kartta imleç "Gez" yazan dairesel bir etikete dönüşsün (özel imleç varsa).

6.4 Tarayıcı modu (siteyi içeride gezme)
  Aktif karta tıklayınca ya da "Siteyi gez" butonuna basınca:
  - Kartın penceresi FLIP tekniğiyle (getBoundingClientRect ölç → transform ile animasyon) ekranın ortasında büyük bir pencereye dönüşsün: masaüstünde genişlik min(1400px, 94vw), yükseklik 90vh; 700 ms, ana easing.
  - Arkadaki sayfa: koyu perde (rgba(4,6,10,.72)) + backdrop-filter: blur(8px). Ana sayfanın kaydırması kilitlensin (yumuşak kaydırma kullanılıyorsa durdur), WebGL render döngüsü dursun (performans).
  - Pencerenin içinde ornekler/<sektor>.html tam etkileşimli bir iframe olarak çalışsın: kaydırma, menü, butonlar, galeriler, formlar.
  - Pencerenin üst çubuğu gerçek bir tarayıcı gibi:
      • Solda üç nokta: kırmızı nokta pencereyi kapatır (hover'da × işareti görünür).
      • Ortada adres çubuğu: kilit ikonu + sahte alan adı (örn. "kozdeocakbasi.com"). Yüklenirken adres çubuğunun altında ince ilerleme çizgisi aksın.
      • Adres çubuğunun yanında "Örnek tasarım" rozeti.
      • Sağda cihaz düğmeleri: Masaüstü / Tablet / Mobil. Tıklayınca iframe'in genişliği 400 ms'de 100% / 820 px / 390 px'e animasyonla değişsin, ortalansın. Tablet ve Mobil'de iframe yuvarlatılmış, ince kenarlıklı bir cihaz çerçevesi içinde dursun. Örnek siteler kendi media query'leriyle tepki verecek.
      • En sağda: ← → (önceki/sonraki örnek; pencere açıkken iframe içerik değiştirir, adres ve renk de değişir) ve ✕ kapat.
  - Pencerenin altında ince bir satış çubuğu: solda "Bu tarzda bir <sektör> sitesi ister misiniz?", sağda "Ara" (tel:) ve "WhatsApp'tan yaz" butonları. WhatsApp mesajı sektöre göre hazır gelsin: "Merhaba Abdullah Bey, sitenizdeki <sektör> örneğini gördüm, benzer bir site istiyorum."
  - Kapatma: ✕, kırmızı nokta, Esc tuşu, perdeye tıklama ve tarayıcının geri tuşu. Açılınca history.pushState ile URL'ye #ornek/<sektor> eklensin; bu adresle sayfa doğrudan açılırsa ilgili örnek otomatik açılsın. Kapanınca pencere FLIP ile karta geri küçülsün ve odak tetikleyen butona dönsün.
  - Erişilebilirlik: pencere role="dialog" aria-modal="true" aria-label="<Site adı> örnek site"; odak pencere içinde kalsın (focus trap); iframe'in title özniteliği dolu olsun.
  - Mobil (genişlik < 768 px): pencere doğrudan tam ekran açılsın (100dvh), cihaz düğmeleri gizlensin, üst çubuk sadeleşsin (adres + ✕), satış çubuğu altta sabit kalsın (safe-area-inset-bottom'a dikkat et).

6.5 Ana sayfa ↔ örnek site iletişimi (postMessage)
  - Ana sayfa → örnek: {type:'autoscroll', on:boolean}, {type:'scrollTop'}.
  - Örnek → ana sayfa: {type:'demo-ready'} (yükleme bitti, ilerleme çizgisini tamamla), {type:'demo-cta', action:'call'|'whatsapp'} (örnek sitenin içindeki form/randevu butonuna basılınca ana sayfa kendi toast'ını göstersin, bkz. 7.0).
  - Mesajlarda event.origin kontrolü yap (aynı origin); bilinmeyen mesajları yok say. contentWindow'un DOM'una doğrudan erişme, sadece postMessage kullan.

======================================================================
7. 6 ÖRNEK SİTE
======================================================================
7.0 Tüm örnek siteler için ortak kurallar
  - Her biri tek dosya, tamamen responsive (390 px'ten 1440 px'e kusursuz), konsolda hata yok, yatay taşma yok.
  - Her biri birbirinden TAMAMEN farklı görünmeli: farklı renk paleti, farklı font eşleşmesi, farklı düzen (hero tipi, grid, kart şekli, buton şekli, köşe yuvarlaklığı), farklı hareket karakteri. Aynı şablonun renk değiştirmiş hali gibi görünürse görev başarısız sayılır. Amaç: "Hazır tema yok, her işletmeye özel tasarım" iddiasını kanıtlamak.
  - Her biri tek sayfa, gerçek bir site hissi verecek bölümlerden oluşsun (aşağıda her biri için listelendi). Sabit header + menü; menü linkleri ilgili bölüme yumuşak kaydırsın; mobilde hamburger menü (açılış animasyonlu, Esc ile kapanan).
  - Metinler Türkçe, inandırıcı, sektöre özgü ve özenli olsun (lorem ipsum YASAK). Fiyat, saat, adres gibi bilgiler gerçekçi ama hayali olsun.
  - İşletme adları tamamen hayali olsun (aşağıda verildi). Gerçek bir işletmeyi çağrıştırmasın.
  - Telefon numaraları hayali ve açıkça örnek olsun: "0258 000 00 00". Adres: "Örnek Mah. Tasarım Cad. No:1, Merkezefendi / Denizli".
  - Görseller: dış görsel dosyası ya da hotlink kullanma. Fotoğraf yerine kaliteli, sektöre uygun CSS/SVG kompozisyonlar kullan (degradeler, şekiller, ikonlar, desenler, illüstratif sahneler). Gri kutu ya da "[Görsel]" yazısı YASAK; her görsel alanı tasarlanmış görünsün. Her görsel alanına data-img="<anahtar>" özniteliği ver ve dosyanın başında yorum satırıyla bir liste bırak; böylece sonradan gerçek fotoğraflarla (<img src="img/...">) kolayca değiştirilebilsin.
  - İkonlar inline SVG (tek bir stilde, emoji yok).
  - Etkileşimli öğeler gerçekten çalışsın (sekme, filtre, galeri lightbox, akordeon, tarih seçimi, form doğrulama). Ama hiçbir form gerçek bir yere veri göndermesin. Form gönderilince:
      • Site iframe içindeyse (window.parent !== window): ana sayfaya {type:'demo-cta'} gönder ve kendi içinde zarif bir bildirim göster: "Bu bir örnek sitedir. Sizin işletmeniz için böyle bir site istiyorsanız: 0553 190 45 11".
      • Tek başına açılmışsa aynı bildirimi kendisi göstersin.
  - Footer'ın en altında küçük, zarif bir satır: "Bu site Abdullah Üçdağ tarafından hazırlanmış örnek bir tasarımdır." (ana sayfaya link).
  - Ana sayfadan gelen {type:'autoscroll'} mesajını dinleyip kendi sayfasını yumuşakça aşağı kaydırsın; {type:'scrollTop'} ile başa dönsün. Yüklenince {type:'demo-ready'} göndersin.
  - prefers-reduced-motion'a uysun. Tıklama alanları ≥ 44×44 px, kontrast ≥ 4.5:1, :focus-visible görünür.
  - Her dosyada <title>, meta description ve kendine ait inline SVG favicon olsun.
  - Dosya başına hedef boyut: 40–90 KB. Hızlı açılmalı.

----------------------------------------------------------------------
7.1 RESTORAN: "Közde Ocakbaşı" (ornekler/restoran.html, adres: kozdeocakbasi.com)
----------------------------------------------------------------------
  Karakter: sıcak, iştah açıcı, samimi ama kaliteli; akşam yemeği ışığı.
  Renk: kömür siyahı #17110D, köz turuncusu #E8662A, tereyağı kremi #F4E9D8, zeytin yeşili #5B6B3A.
  Font: başlık "Fraunces" (yumuşak serif, italik vurgular), gövde "Inter".
  Düzen: tam ekran hero; büyük ve hafif eğik yazılmış başlık; köşeleri az yuvarlak (6 px); kâğıt dokusu hissi.
  Bölümler:
    1. Hero: "Odun ateşinde, acele etmeden." + alt metin + "Rezervasyon yap" ve "Menüyü gör" butonları. Arka planda CSS ile yavaşça titreşen köz parıltısı ve yükselen kıvılcım parçacıkları (hafif, canvas yok, CSS ile).
    2. Menü: sekmeler (Başlangıçlar / Izgaralar / Tatlılar / İçecekler). Sekme değişince ürünler yumuşak geçişle değişsin. Her üründe isim, kısa açıklama, noktalı çizgiyle ayrılmış fiyat (₺), "Şefin önerisi" / "Acılı" rozetleri. En az 6 ürün/sekme.
    3. Günün menüsü: büyük tek kart, günün tarihiyle (JS ile bugünün tarihi) birlikte.
    4. Galeri: 6 kareli asimetrik grid; tıklayınca lightbox (← → ve Esc ile).
    5. Rezervasyon: tarih (bugünden itibaren 14 gün, yatay kaydırmalı gün seçici), saat (18:00–23:00 arası 30 dk aralıklarla hap düğmeler, bazıları "dolu" olarak pasif), kişi sayısı (− / + sayaç), isim ve telefon alanları, doğrulama. Gönderince 7.0'daki örnek bildirimi.
    6. Yorumlar: 3 müşteri yorumu, 5 yıldız, yavaşça kayan şerit.
    7. İletişim: çalışma saatleri tablosu (bugünün satırı vurgulu, "Şu an açık / kapalı" durumu JS ile), CSS ile çizilmiş stilize harita, yol tarifi butonu.
  Hareket: yumuşak ve sıcak. Öğeler aşağıdan hafif yukarı belirsin; fiyatlar rakam rakam sayarak gelsin.

----------------------------------------------------------------------
7.2 KLİNİK: "Lavanta Ağız ve Diş Sağlığı" (ornekler/klinik.html, adres: lavantadis.com)
----------------------------------------------------------------------
  Karakter: temiz, sakin, güven veren, steril ama soğuk değil.
  Renk: beyaz #FFFFFF, kırık beyaz #F6F7FB, lavanta #7C6CF2, derin lacivert metin #1C2140, nane yeşili #3CCB9B (onay durumları).
  Font: başlık "Manrope" 700, gövde "Manrope" 400.
  Düzen: AÇIK tema (diğer örneklerden ayrışsın); bol beyaz alan; yuvarlak köşeler (20 px); yumuşak gölgeler; hap şeklinde butonlar.
  Bölümler:
    1. Hero: solda "Gülüşünüz, uzman ellerde." + "Online randevu al" butonu + üç güven rozeti (örn. "15 yıllık deneyim", "Steril ortam", "Taksit imkânı"); sağda yumuşak şekillerle soyut bir diş/gülüş illüstrasyonu (SVG), üstünde yüzen küçük bilgi kartları ("Bugün 4 boş randevu").
    2. Tedaviler: 6 kart (İmplant, Ortodonti, Diş beyazlatma, Kanal tedavisi, Çocuk diş hekimliği, Estetik dolgu). Her kartta ikon, kısa açıklama, "Süre: ~45 dk" bilgisi. Tıklayınca kart genişleyip ayrıntı göstersin.
    3. Hekimlerimiz: 3 hekim kartı (hayali isimler, uzmanlık, CSS ile soyut portre avatarı).
    4. Önce / Sonra: sürüklenebilir karşılaştırma kaydırıcısı (iki SVG gülüş illüstrasyonu arasında; fare ve dokunmatikle çalışsın, klavyede ← → ile).
    5. Randevu sihirbazı: 3 adımlı (1. Tedavi seç → 2. Hekim ve tarih/saat seç → 3. Bilgiler). Üstte adım göstergesi, adımlar arası kayarak geçiş, geri dönebilme, her adımda doğrulama. Sonunda örnek bildirim.
    6. Sık sorulanlar: akordeon (5 soru).
    7. İletişim + çalışma saatleri + stilize harita.
  Hareket: çok sakin; sadece opaklık ve 12 px'lik yumuşak kaymalar. Hiçbir şey zıplamasın.

----------------------------------------------------------------------
7.3 TEKSTİL: "Linora Tekstil" (ornekler/tekstil.html, adres: linoratekstil.com)
----------------------------------------------------------------------
  Karakter: kurumsal üretici, ihracat yapan; editoryal, modaya yakın, güçlü. Denizli'nin ev tekstili (havlu, bornoz, nevresim) kimliği.
  Renk: keten beji #EDE6DA, pamuk beyazı #FBFAF7, grafit #26262A, indigo #2E3A8C.
  Font: başlık "Playfair Display" (büyük, editoryal), gövde "Work Sans"; küçük etiketler büyük harf ve geniş aralıklı.
  Düzen: dergi düzeni; asimetrik grid; çok büyük başlıklar; ince çizgiler; köşeler keskin (0 px).
  Bölümler:
    1. Hero: "Denizli'den dünyaya, 1987'den beri." + yatay akan büyük ürün kategorileri şeridi (Havlu · Bornoz · Nevresim · Pike). Arka planda dokuma deseni (CSS repeating-linear-gradient) yavaşça hareket etsin.
    2. Rakamlarla biz: 4 sayaç (yıllık üretim, ihracat yapılan ülke sayısı, çalışan sayısı, yıllık deneyim), görünür olunca sayarak artsın.
    3. Koleksiyonlar: filtreli ürün grid'i (Tümü / Havlu / Bornoz / Nevresim). Filtrelemede öğeler FLIP animasyonuyla yer değiştirsin. Her üründe kumaş desenli CSS görsel, ad, "gramaj", "renk seçenekleri" (renk noktaları).
    4. Üretim süreci: İplik → Dokuma → Boya → Konfeksiyon → Kalite kontrol. Kaydırdıkça dolan yatay zaman çizgisi.
    5. Sertifikalar: OEKO-TEX, GOTS, ISO 9001 gibi rozetler (sade, tek renk SVG; "örnek" niteliğinde).
    6. Toptan teklif formu: firma adı, ülke (açılır liste), ürün grubu (çoklu seçim chip'leri), adet (aralık kaydırıcısı), mesaj. Doğrulama + örnek bildirim.
    7. Dil değiştirici: TR / EN düğmesi. En azından hero, menü ve bölüm başlıkları İngilizceye çevrilsin (ihracatçı hissi).
  Hareket: editoryal; büyük başlıklar satır maskesiyle gelsin, görseller hafif parallax.

----------------------------------------------------------------------
7.4 OTEL: "Travertina Termal Otel" (ornekler/otel.html, adres: travertina.com.tr)
----------------------------------------------------------------------
  Karakter: lüks, sessiz, beş yıldızlı termal tatil; Pamukkale traverten beyazı ve termal su turkuazı.
  Renk: traverten beyazı #F3F0EA, kum #D9CBB3, termal turkuaz #5FB8B3, gece mavisi #14212B, altın #B8955A (çok az).
  Font: başlık "Cormorant Garamond" (ince, zarif, büyük), gövde "Jost"; küçük etiketler geniş harf aralıklı.
  Düzen: çok geniş boşluklar, ortalanmış simetrik kompozisyon, ince altın çizgiler, köşeler 2 px.
  Bölümler:
    1. Hero: tam ekran, katmanlı traverten teraslarını andıran SVG/CSS sahne (beyaz basamaklar, turkuaz su, yavaş dalgalanan su yüzeyi). Ortada "Zamanın yavaşladığı yer." Altında rezervasyon çubuğu: giriş tarihi, çıkış tarihi, misafir sayısı, "Müsaitlik ara".
    2. Odalar: yatay kaydırmalı oda kartları (Standart, Deluxe Termal, Süit, Kral Dairesi). Her kartta m², kişi sayısı, olanak ikonları, "gecelik ₺…'den başlayan" fiyat. Tıklayınca ayrıntı paneli açılsın.
    3. Termal & Spa: hizmet listesi (termal havuz, hamam, masaj, sauna) ve saat bilgisi.
    4. Deneyimler: Pamukkale turu, Hierapolis, Laodikeia, gün batımı, şarap tadımı. Hover'da büyüyen kartlar.
    5. Gastronomi: restoran tanıtımı + örnek menü.
    6. Rezervasyon: takvimli tarih aralığı seçici (iki aylık görünüm, geçmiş günler pasif, seçilen aralık vurgulu, gece sayısı otomatik). Oda seçimi + misafir sayısı + toplam fiyat hesaplama (gece × oda fiyatı). Doğrulama + örnek bildirim.
    7. Konum ve ulaşım: havalimanı ve Pamukkale'ye mesafeler.
  Hareket: çok yavaş ve sinematik (1–1,4 sn), hafif parallax, görseller yumuşak "Ken Burns" yakınlaşması.

----------------------------------------------------------------------
7.5 OTO SERVİS: "Kervan Oto Servis" (ornekler/oto-servis.html, adres: kervanoto.com)
----------------------------------------------------------------------
  Karakter: güçlü, teknik, hızlı, güvenilir; garaj ve performans hissi.
  Renk: asfalt #0F1113, çelik grisi #2A2F35, sinyal turuncusu #FF6A1A, uyarı sarısı #FFC22E (çok az), beyaz metin.
  Font: başlık "Barlow Condensed" 700 (büyük harf, sıkışık), gövde "Barlow".
  Düzen: koyu; çapraz kesimli bölüm geçişleri (clip-path ile eğik kenarlar); köşeler 4 px; teknik çizgiler ve ölçü işaretleri gibi detaylar.
  Bölümler:
    1. Hero: "Aracınız emin ellerde." + "Servis randevusu al" butonu + üç hızlı bilgi ("45 dk ekspres bakım", "Garantili parça", "7/24 yol yardım"). Arka planda CSS/SVG ile çizilmiş araç silueti ve hafif tarama ışığı.
    2. Hizmetler: 8 hizmet ikonlu grid (Periyodik bakım, Fren, Motor arıza tespiti, Lastik, Klima, Elektrik, Kaporta-boya, Yağ değişimi).
    3. Bakım fiyatı hesaplayıcı: marka (açılır liste), model yılı, yakıt tipi (Benzin/Dizel/LPG/Hibrit chip'leri), bakım tipi (Küçük/Büyük). "Tahmini fiyat aralığı" anında hesaplanıp sayarak değişsin. Altında "Bu fiyatlar örnektir" notu.
    4. Plaka ile randevu: Türk plakası görünümünde (mavi TR şeridi olan) bir giriş alanı; plaka formatı doğrulaması (örn. 20 ABC 123), bakım tipi, tarih/saat seçimi. Örnek bildirim.
    5. Neden biz: rakamlar (yıl, servis edilen araç, memnuniyet oranı) sayaçlarla.
    6. Yol yardım: büyük, dikkat çekici şerit: "7/24 Yol Yardım" + büyük arama butonu (örnek numara).
    7. Yorumlar ve iletişim + çalışma saatleri.
  Hareket: hızlı ve kesin (250–400 ms); öğeler yandan kayarak gelsin; butonlarda metalik parlama süzmesi.

----------------------------------------------------------------------
7.6 KUAFÖR: "Nil Atelier" (ornekler/kuafor.html, adres: nilatelier.com)
----------------------------------------------------------------------
  Karakter: modern, butik, şık, sosyal medyaya uygun; kadın kuaförü / güzellik stüdyosu.
  Renk: pudra pembesi #F2D9D3, fildişi #FBF6F1, terrakota #C2674F, mürdüm #3B1E2B (metin), şampanya #E3C9A8.
  Font: başlık "DM Serif Display", gövde "DM Sans".
  Düzen: yumuşak organik şekiller (blob'lar), kemer (arch) biçimli görsel çerçeveler, yuvarlak köşeler (28 px), Instagram estetiği.
  Bölümler:
    1. Hero: kemer biçimli büyük görsel alanı (CSS ile soyut saç dalgası illüstrasyonu) + "Kendinizi yeniden keşfedin." + "Online randevu" butonu. Arka planda yavaşça şekil değiştiren blob'lar.
    2. Hizmetler ve fiyat listesi: kategoriler (Saç kesim, Boya & Balyaj, Bakım, Gelin saçı, Manikür, Kaş-kirpik). Akordeon yapısında, her satırda hizmet, süre ve fiyat.
    3. Ekibimiz: 4 stilist kartı; hover'da kart dönüp (flip) uzmanlık alanlarını göstersin.
    4. Galeri: "Instagram" görünümlü 3×3 grid; hover'da beğeni ikonu; tıklayınca lightbox.
    5. Randevu: hizmet seçimi (çoklu, toplam süre ve fiyat otomatik toplansın) → stilist seçimi (veya "Fark etmez") → tarih ve saat seçimi → isim/telefon. Örnek bildirim.
    6. Paketler: 3 paket kartı (örn. "Gelin paketi", "Bakım paketi", "Yenilen paketi"), ortadaki "En çok tercih edilen" olarak vurgulu.
    7. Yorumlar + iletişim + çalışma saatleri.
  Hareket: yumuşak, akıcı, hafif yaylanan (spring benzeri) geçişler; hover'larda zarif büyümeler.

======================================================================
8. PORTFOLYO VE ÖRNEK SİTELER: KALİTE VE PERFORMANS
======================================================================
  - Ana sayfanın ilk yüklemesinde hiçbir örnek site yüklenmesin. Sadece portfolyo bölümüne yaklaşınca (IntersectionObserver, rootMargin 400px) aktif kartın iframe'i yüklensin.
  - Tarayıcı modu açıkken ana sayfadaki WebGL ve diğer requestAnimationFrame döngüleri dursun, kapanınca devam etsin.
  - iframe'lere loading="lazy", title ve sandbox="allow-scripts allow-same-origin allow-forms" ver.
  - prefers-reduced-motion: FLIP ve otomatik kaydırma kapalı; pencere anında açılıp kapansın.
  - Klavye: portfolyo şeridinde ← → ile gezinme, Enter ile tarayıcı modunu açma, Esc ile kapatma. Tüm butonlarda görünür odak halkası.
  - Animasyonlarda sadece transform ve opacity; layout kayması (CLS) yok.
  - Ne ana sayfada ne örnek sitelerde konsol hatası olsun.

======================================================================
9. KABUL KRİTERLERİ (bitirince kendin test et)
======================================================================
Yerel sunucuyla (python3 -m http.server 8080) açıp Playwright ile (veya tarayıcıda) sayfayı baştan sona kaydırarak ekran görüntüsü al ve kontrol et. Ana site için: 1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 360×740. Örnek siteler için: 1440×900 ve 390×844.

Ana site
  [ ] Hiçbir genişlikte yatay kaydırma çubuğu yok (scrollWidth === innerWidth).
  [ ] "ÜÇDAĞ" yazıları (geçit başlangıcı ve footer) ve hero başlığı ekranın içinde.
  [ ] Telefon numarası her genişlikte tek satır.
  [ ] Header hiçbir içerikle okunaksız şekilde çakışmıyor.
  [ ] WebGL ızgara çizgileri tırtıksız ve yumuşak.
  [ ] Masaüstü menü ve mobil perde menü çalışıyor, Esc ile kapanıyor.
  [ ] prefers-reduced-motion ile sayfa sorunsuz ve tamamen okunabilir.

Portfolyo ve tarayıcı modu
  [ ] 6 kart var; tıklanan pasif kart ortaya kayıyor; sektör hapları, oklar ve klavye çalışıyor; mobilde parmakla kaydırma çalışıyor.
  [ ] 6.1'deki hataların hepsi giderildi: ipucu çakışması yok, önizleme içeriği taşmıyor, tek "Siteyi gez" butonu var, boş daire kalmadı, pasif kartlar görünür.
  [ ] Aktif kartın önizlemesi gerçek örnek site; hover'da otomatik kayıyor; pasif kartlarda iframe yok.
  [ ] Tarayıcı modu FLIP ile açılıyor; içerideki site tamamen gezilebiliyor; Masaüstü/Tablet/Mobil düğmeleri genişliği değiştiriyor ve site responsive tepki veriyor; ← → ile örnekler arasında geçiliyor; ✕ / Esc / perde / geri tuşu kapatıyor; #ornek/<sektor> adresiyle doğrudan açılıyor.
  [ ] Satış çubuğunda doğru sektörlü WhatsApp mesajı oluşuyor.

Örnek siteler
  [ ] 6 sitenin her biri tek başına da (doğrudan dosyayı açınca) çalışıyor.
  [ ] 6 site birbirinden açıkça farklı görünüyor (yan yana ekran görüntüsü al ve karşılaştır).
  [ ] Her sitedeki tüm interaktif öğeler (sekme, filtre, lightbox, takvim, hesaplayıcı, sihirbaz, form doğrulama) çalışıyor; formlar örnek bildirimi gösteriyor ve hiçbir yere veri göndermiyor.
  [ ] 390 px'te hiçbir sayfada yatay taşma yok.
  [ ] Lorem ipsum, gri boş kutu, "[Görsel]" yazısı ya da gerçek bir işletmeye ait isim/telefon yok.

Genel
  [ ] Ne ana sitede ne örnek sitelerde konsol hatası var.

Son olarak bana şunları ver: oluşturulan/değişen dosyaların listesi, ana sitede bölüm bölüm yapılan değişiklikler, her örnek site için kısa özet (renk, font, öne çıkan etkileşim) ve hâlâ gerçek içerik bekleyen yerler (data-img fotoğraf alanları, OG görseli, canonical URL).
