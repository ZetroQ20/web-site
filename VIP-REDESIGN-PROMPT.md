Sen üst düzey bir kreatif geliştirici ve dijital ürün tasarımcısısın (Awwwards "Site of the Day" seviyesinde iş çıkaran biri). Elimde tek dosyalık bir site var: index.html (Abdullah Üçdağ — Denizli web tasarım). Bu dosyayı "VIP / lüks / 10.000 $'lık stüdyo sitesi" seviyesine çıkarmanı istiyorum. Aşağıdaki talimatları eksiksiz uygula.

====================================================================
0. ÇALIŞMA ŞEKLİ (önce bunu oku)
====================================================================
1. Kod yazmadan önce index.html'in TAMAMINI oku (CSS, HTML, JS ve WebGL shader dahil). Mevcut sınıf adlarını, data-sec / data-col / data-r / data-scr / .mag / .vel gibi mekanikleri ve kaydırma (pin) sistemini anla.
2. Sonra bana kısa bir plan yaz: hangi bölümde ne değişecek. Ardından uygula.
3. Değiştirmeyeceklerin:
   - Tek dosya yapısı (her şey index.html içinde kalacak).
   - Telefon numarası (0553 190 45 11, tel:+905531904511), WhatsApp linkleri, isim, şehir.
   - Bölümlerin sırası ve metinlerin anlamı (metinleri sadece aşağıda istediğim yerlerde sadeleştir).
   - Turkuaz (#3DF2E0) markanın imza rengi olarak kalacak.
4. Harici JS kütüphanesi EKLEME (GSAP, Three.js, Lenis vb. yok). Vanilla JS + CSS + mevcut WebGL2 kullan. Font için sadece Google Fonts kullanılabilir.
5. Her adımdan sonra sayfanın hatasız açıldığını kontrol et (konsolda hata olmamalı).

====================================================================
1. KESİN DÜZELTİLECEK HATALAR (ölçülmüş, gerçek hatalar)
====================================================================
1.1 Taşan dev "ÜÇDAĞ" yazıları
   - [01] Geçit bölümündeki .z-word (font-size: 24vw, white-space: nowrap): 1440 px'te sol -42 px / sağ 1482 px, 390 px'te sol -11 px / sağ 401 px; yani her ekranda iki yandan ekran dışına taşıyor. Çözüm: font-size'ı clamp() ile ekrana sığdır (örn. clamp(72px, 19vw, 300px)), letter-spacing'i -0.04em'e çek, kelimenin gerçek genişliğini JS ile ölçüp (getBoundingClientRect) ekran genişliğinin %92'sini aşmayacak şekilde ölçekle. Zoom animasyonu (--z ölçeği) sırasında taşma kasıtlı olabilir, ama BAŞLANGIÇ durumunda kelime tamamen ekranın içinde ve ortalanmış olmalı.
   - Footer'daki .mark (font-size: 25vw, margin-left: -1vw): ekranın tamamını kaplıyor ve soldan taşıyor; kaba ve "ucuz" görünüyor. Çözüm: yaklaşık 16–18vw'ye indir, ortala, margin-left negatifini kaldır, kenarlarda en az 4vw boşluk kalsın. Kontur rengi çok hafif kalsın (rgba(232,241,240,.10)), kaydırmayla veya imleçle dolsun (bkz. 3.10).
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
   - 360, 390, 768, 1024, 1280, 1440 ve 1920 px genişliklerde document.documentElement.scrollWidth === innerWidth olmalı. Hiçbir metin öğesi (yatay kayan kart şeridi ve 3B silindir hariç) ekranın dışına çıkmamalı.

====================================================================
2. VIP / LÜKS YÖN: genel tasarım dili
====================================================================
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

====================================================================
3. BÖLÜM BÖLÜM VIP DOKUNUŞLAR
====================================================================
3.1 Header (.hud)
   - Sol: logo + "ÜÇDAĞ" (Unbounded 600, letter-spacing .08em). Orta: masaüstünde sade menü: İşler · Hizmetler · Süreç · SSS · İletişim (yumuşak kaydırmayla ilgili bölüme gitsin, aktif bölüm altında ince turkuaz çizgi). Mobilde menü → sağda "Menü" butonu → tam ekran, büyük serif linklerle açılan perde menü (açılış 600 ms, linkler sırayla gelsin, Esc ile kapansın, odak menü içinde kalsın).
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

3.8 YENİ BÖLÜM: [05] İşler — yatay kaydırmalı portfolyo (Süreç'ten sonra, Simülatör'den önce; sonraki bölüm numaralarını kaydır)
   - Başlık: "Seçili işler." ("işler" italik serif). Sağda kısa açıklama.
   - Yan yana 5 proje kartı, tarayıcı penceresi görünümünde (üstte 3 nokta + adres çubuğu), oran 16:10.
   - Aktif kart ortada, tam boy ve net. Yandakiler scale(.86), opacity .35, filter: blur(2px) saturate(.6).
   - Yandaki bir karta tıklayınca şerit 900 ms'de yumuşakça kayar ve o kart ortaya gelir.
   - Altta gezinme: numaralı noktalar + mini önizleme görselleri; tıklayınca ilgili projeye kayar. ← → okları (görünür butonlar), klavyede ← → tuşları, mobilde parmakla kaydırma (scroll-snap-type: x mandatory, her kart ortaya otursun) çalışsın.
   - Aktif kartın içindeki görsel sitenin TAM BOY ekran görüntüsüdür. Üzerine gelince (mobilde dokununca) görsel yukarıdan aşağıya ~7 sn'de yavaşça kayar (transform: translateY ile, object-position değil); imleç çıkınca 600 ms'de başa döner.
   - Kartın yanında (mobilde altında) bilgi paneli: proje adı (serif), sektör, şehir, yapılan işler (ince kenarlıklı chip'ler), yıl ve "Siteyi gör ↗" linki. Proje değişince metinler satır maskesiyle değişsin.
   - Aktif projenin ana rengi CSS değişkeniyle arka plandaki WebGL ızgarasına ve bölümdeki vurgulara yumuşakça (1,2 sn) yansısın.
   - İmleç kart üzerindeyken özel imleç "Görüntüle" yazan dairesel bir etikete dönüşsün.
   - Veri JS'te tek bir dizide tutulsun ki sonra kolayca değiştirilebilsin:
     const projects = [{ name, sector, city, tags: [], year, color, image, thumb, url }]
   - Şimdilik yer tutucu projeler: Pamukkale Pide (restoran), Ege Diş Kliniği (sağlık), Denizli Tekstil (üretim), Termal Otel (turizm), Usta Oto Servis (otomotiv). Gerçek görsel olmadığı için her biri için CSS/SVG ile çizilmiş, sektörüne uygun renklerde, inandırıcı ve uzun (dikey) sahte site önizlemesi üret (hero, menü, kartlar, footer içeren). Görsel dosyası gerektirmesin.

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

====================================================================
4. TEKNİK KALİTE (VIP site teknik olarak da kusursuz olmalı)
====================================================================
- <head>: Open Graph ve Twitter kart etiketleri (başlık, açıklama, 1200×630 görsel için yer tutucu), inline SVG favicon (logodan), theme-color #050608, canonical yer tutucusu.
- JSON-LD ile LocalBusiness / ProfessionalService şeması (isim, telefon, Denizli, hizmet alanı).
- Erişilebilirlik: tüm etkileşimli öğeler klavyeyle kullanılabilir, :focus-visible halkası net (turkuaz, 2 px, offset 3 px), tıklama alanları en az 44×44 px, dekoratif öğelerde aria-hidden, portfolyo şeridinde role="region" aria-roledescription="carousel" ve her slaytta aria-label="3 / 5: Ege Diş Kliniği". Başlık hiyerarşisi tek h1, sonra h2/h3.
- prefers-reduced-motion: reduce açıkken yükleme ekranı, pin/scroll-jacking, eğilme, otomatik kayma, gren animasyonu ve yumuşak kaydırma kapansın; içerik doğrudan görünsün. WebGL tek kare çizip dursun.
- Performans: WebGL render döngüsü sekme görünmezken (visibilitychange) ve canvas görünür olmadığında dursun. Mobilde (pointer: coarse veya genişlik < 768) render ölçeği 0.5 ile sınırlı, FPS hedefi 30. WebGL2 yoksa mevcut .nogl yedeği zarif bir degrade olarak çalışsın.
- Animasyonlarda sadece transform ve opacity kullan; width/height/top/left animasyonu yok. Layout shift (CLS) olmasın.
- Konsolda hiç hata veya uyarı olmasın.

====================================================================
5. KABUL KRİTERLERİ: bitirdiğinde kendin kontrol et
====================================================================
Playwright ile (veya tarayıcıda) şu genişliklerde sayfayı baştan sona kaydırarak ekran görüntüsü al ve kontrol et: 1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 360×740.
[ ] Hiçbir genişlikte yatay kaydırma çubuğu yok (scrollWidth === innerWidth).
[ ] "ÜÇDAĞ" yazıları (geçit başlangıcı ve footer) ve hero başlığı ekranın içinde.
[ ] Telefon numarası her genişlikte tek satır.
[ ] Header hiçbir içerikle okunaksız şekilde çakışmıyor.
[ ] WebGL ızgara çizgileri tırtıksız, yumuşak.
[ ] Portfolyo: tıklama, noktalar, oklar, klavye ve mobil kaydırma çalışıyor; hover'da sitenin görseli aşağı kayıyor.
[ ] Mobil menü açılıp kapanıyor, Esc çalışıyor.
[ ] prefers-reduced-motion ile sayfa sorunsuz ve tamamen okunabilir.
[ ] Konsolda hata yok.
Son olarak: yaptığın tüm değişiklikleri bölüm bölüm madde madde listele ve hâlâ gerçek içerik bekleyen yerleri (portfolyo görselleri, OG görseli, canonical URL) ayrıca belirt.
