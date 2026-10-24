Sen üst düzey bir kreatif geliştirici ve web tasarımcısısın (Awwwards "Site of the Day" seviyesinde). Elimde Abdullah Üçdağ'ın (Denizli, web tasarım) sitesi var: index.html. Koyu tema, turkuaz vurgu (#3DF2E0), Unbounded + Geist + Geist Mono (+ varsa Instrument Serif) fontları, arka planda WebGL2 ile çizilen 3B ızgara, kaydırmaya bağlı numaralı bölümler var. Sitede "[05] İşler" adında yatay kaydırmalı bir portfolyo bölümü de var: kartlar yan yana duruyor, tıklanan kart ortaya kayıyor, sağda bilgi paneli (proje adı, sektör, şehir, etiketler, yıl, ← → okları, "Siteyi gör" butonu), altta numaralı küçük gezinme düğmeleri bulunuyor.

Bu görevde iki şey yapacaksın:
  A) Portfolyo bölümündeki hataları düzeltip bölümü "Sektör örnekleri" konseptine çevireceksin.
  B) Her sektör için sitenin İÇİNDE gezilebilen, birbirinden tamamen farklı görünen 6 örnek (demo) site tasarlayıp kodlayacaksın.
Bunlar gerçek müşteri işi DEĞİL. Yayınlanmamış örnek tasarımlar; ziyaretçi "benim işletmemin sitesi böyle olabilir" diye fikir edinsin diye var.

======================================================================
0. ÇALIŞMA KURALLARI (önce bunu oku)
======================================================================
1. Kod yazmadan önce index.html'in TAMAMINI oku: CSS, HTML, JS, WebGL shader, portfolyo bölümünün mevcut kodu. Mevcut sınıf adlarını, renk değişkenlerini, easing'i (cubic-bezier(.16,1,.3,1)), data-sec / data-col / data-r gibi mekanikleri ve kaydırma (pin) sistemini anla.
2. Bana kısa bir plan yaz (hangi dosyalar oluşacak, ana sayfada ne değişecek), sonra uygula.
3. Değiştirmeyeceklerin: telefon numarası (0553 190 45 11, tel:+905531904511), WhatsApp linkleri (wa.me/905531904511), isim, şehir, diğer bölümlerin içeriği ve ana sitenin genel görünümü.
4. Harici JS kütüphanesi yok (GSAP, Three.js, Swiper vb. yok). Vanilla JS + CSS. Fontlar sadece Google Fonts'tan.
5. Dosya yapısı:
     index.html                    (ana site)
     ornekler/restoran.html
     ornekler/klinik.html
     ornekler/tekstil.html
     ornekler/otel.html
     ornekler/oto-servis.html
     ornekler/kuafor.html
   Her örnek site TEK BAŞINA çalışan, kendi CSS ve JS'i içinde olan tek bir HTML dosyası olsun. Ortak dosya yok. Böylece her biri bağımsız düzenlenebilir.
6. Test için dosyaları file:// ile değil, yerel bir sunucuyla aç (python3 -m http.server 8080). iframe iletişimi bunu gerektirir.

======================================================================
A) PORTFOLYO BÖLÜMÜ: DÜZELTMELER VE YENİ KONSEPT
======================================================================

A.1 Mevcut hatalar (ekran görüntüsünde tespit edildi, hepsini düzelt)
  - Önizleme penceresindeki "Üzerine gel · sayfayı kaydır" ipucu, gri bir iskelet çubuğunun altında kalıyor ve onunla üst üste biniyor. İpucu ayrı bir katmanda, önizlemenin alt ortasında, yarı saydam koyu bir hap (pill) içinde dursun; içerikle asla çakışmasın; kullanıcı bir kez etkileşime girince kaybolsun.
  - Önizlemenin içindeki "45 Dk Ekspres · Garantili Parça · 7/24 Yol Yardım" satırında son öğe pencerenin sağ kenarına dayanıp kesiliyor. Önizleme içeriği hiçbir yerde pencere kenarından taşmamalı (overflow: hidden ve doğru iç boşluk).
  - Önizlemenin üst kısmındaki "Aracınızın plakasını ve bakım tipini seçin…" satırı adres çubuğunun hemen altında kesilmiş görünüyor. Önizleme her zaman içeriğin en üstünden (sitenin header'ından) başlasın.
  - "Siteyi gör" butonu iki yerde var (önizlemenin içinde ve bilgi panelinde). Önizlemenin içindekini kaldır. Bilgi panelinde tek bir birincil buton kalsın: "Siteyi gez ↗".
  - Önizlemenin solunda, içi boş, büyük ve garip bir daire/yay çizgisi var. Özel imleç halkası ya da dekoratif bir öğe yanlış yerde kalıyorsa kaldır.
  - Yandaki (pasif) kartlar neredeyse görünmüyor; ziyaretçi şeritte başka kart olduğunu anlamıyor. Pasif kartlar: scale(.86), opacity .45, hafif blur(1.5px), üzerlerinde sektör adı okunabilir olsun. Kenarlardaki kartlar ekran kenarına doğru yumuşak bir maske (mask-image: linear-gradient) ile kaybolsun.
  - Önizleme penceresi ile bilgi paneli dikeyde ortalı ve aynı hizada olsun; önizleme bilgi panelinden belirgin şekilde büyük olsun (masaüstünde yaklaşık 7/12 – 5/12 oran).
  - Alt gezinme düğmeleri (01–05): yerine sektör adı yazan ince hap düğmeler gelsin ("Restoran", "Klinik"…); aktif olan dolu, diğerleri ince kenarlıklı. Mobilde yatay kaydırılabilir tek satır.

A.2 Yeni konsept: "Sektör örnekleri"
  - Bölüm etiketi: "[05] Örnekler". Başlık: "Sizin siteniz böyle olabilir." ("böyle olabilir" vurgulu; varsa italik serif).
  - Sağdaki açıklama: "Her sektör için sıfırdan tasarladığım örnek siteler. Birini seçin, içine girin ve gerçek bir site gibi gezin."
  - Bilgi panelinde yıl yerine küçük bir "Örnek tasarım" rozeti olsun. Ziyaretçiyi yanıltacak "müşterim", "yaptığım iş" gibi ifadeler kullanma.
  - Kart sayısı 6 (aşağıdaki B bölümündeki sektörler). Bilgi panelinde: site adı, sektör, "Denizli", 4 etiket (o sitenin öne çıkan özellikleri), ← → okları, "Siteyi gez ↗" butonu.
  - Aktif projenin ana rengi (accent) CSS değişkeniyle (--pa) bölümdeki vurgulara ve arka plandaki WebGL ızgarasının rengine 1,2 sn'de yumuşakça yansısın (mevcut renk mekanizmasını kullan).

A.3 Kart önizlemeleri (canlı, ama hafif)
  - Aktif kartın önizlemesi o örnek sitenin KENDİSİ olsun: kartın içinde iframe ile ornekler/<sektor>.html yüklensin, 1280 px genişlikte render edilip transform: scale() ile kart genişliğine küçültülsün. pointer-events: none (kartta tıklama kartın kendisine gitsin).
  - Aktif kartın üzerine gelince önizleme otomatik olarak yavaşça aşağı kaysın (yaklaşık 8 sn'de sayfanın sonuna). Bunu iframe'e postMessage ile {type:'autoscroll', on:true/false} göndererek yap; örnek site bu mesajı alınca kendi içinde yumuşak kaydırma yapsın (B.0'a bak). İmleç çıkınca 600 ms'de başa dönsün.
  - Pasif kartlarda iframe YÜKLEME: bunun yerine CSS ile çizilmiş hafif bir "poster" göster (o sitenin renkleri, logosu, büyük başlığı). Aynı anda en fazla 1 önizleme iframe'i ve 1 tam ekran iframe'i yaşasın. Kart pasifleşince iframe'i kaldır (src="about:blank" ve DOM'dan çıkar).
  - iframe yüklenirken poster görünsün, yüklenince 300 ms çapraz geçişle önizlemeye dönsün.
  - Aktif kartta imleç "Gez" yazan dairesel bir etikete dönüşsün (özel imleç varsa).

A.4 Tarayıcı modu (siteyi içeride gezme)
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

A.5 Ana sayfa ↔ örnek site iletişimi (postMessage)
  - Ana sayfa → örnek: {type:'autoscroll', on:boolean}, {type:'scrollTop'}.
  - Örnek → ana sayfa: {type:'demo-ready'} (yükleme bitti, ilerleme çizgisini tamamla), {type:'demo-cta', action:'call'|'whatsapp'} (örnek sitenin içindeki form/randevu butonuna basılınca ana sayfa kendi toast'ını göstersin, bkz. B.0).
  - Mesajlarda event.origin kontrolü yap (aynı origin); bilinmeyen mesajları yok say. contentWindow'un DOM'una doğrudan erişme, sadece postMessage kullan.

======================================================================
B) 6 ÖRNEK SİTE
======================================================================

B.0 Tüm örnek siteler için ortak kurallar
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
B.1 RESTORAN: "Közde Ocakbaşı" (ornekler/restoran.html, adres: kozdeocakbasi.com)
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
    5. Rezervasyon: tarih (bugünden itibaren 14 gün, yatay kaydırmalı gün seçici), saat (18:00–23:00 arası 30 dk aralıklarla hap düğmeler, bazıları "dolu" olarak pasif), kişi sayısı (− / + sayaç), isim ve telefon alanları, doğrulama. Gönderince B.0'daki örnek bildirimi.
    6. Yorumlar: 3 müşteri yorumu, 5 yıldız, yavaşça kayan şerit.
    7. İletişim: çalışma saatleri tablosu (bugünün satırı vurgulu, "Şu an açık / kapalı" durumu JS ile), CSS ile çizilmiş stilize harita, yol tarifi butonu.
  Hareket: yumuşak ve sıcak. Öğeler aşağıdan hafif yukarı belirsin; fiyatlar rakam rakam sayarak gelsin.

----------------------------------------------------------------------
B.2 KLİNİK: "Lavanta Ağız ve Diş Sağlığı" (ornekler/klinik.html, adres: lavantadis.com)
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
B.3 TEKSTİL: "Linora Tekstil" (ornekler/tekstil.html, adres: linoratekstil.com)
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
B.4 OTEL: "Travertina Termal Otel" (ornekler/otel.html, adres: travertina.com.tr)
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
B.5 OTO SERVİS: "Kervan Oto Servis" (ornekler/oto-servis.html, adres: kervanoto.com)
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
B.6 KUAFÖR: "Nil Atelier" (ornekler/kuafor.html, adres: nilatelier.com)
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
C. KALİTE VE PERFORMANS
======================================================================
  - Ana sayfanın ilk yüklemesinde hiçbir örnek site yüklenmesin. Sadece portfolyo bölümüne yaklaşınca (IntersectionObserver, rootMargin 400px) aktif kartın iframe'i yüklensin.
  - Tarayıcı modu açıkken ana sayfadaki WebGL ve diğer requestAnimationFrame döngüleri dursun, kapanınca devam etsin.
  - iframe'lere loading="lazy", title ve sandbox="allow-scripts allow-same-origin allow-forms" ver.
  - prefers-reduced-motion: FLIP ve otomatik kaydırma kapalı; pencere anında açılıp kapansın.
  - Klavye: portfolyo şeridinde ← → ile gezinme, Enter ile tarayıcı modunu açma, Esc ile kapatma. Tüm butonlarda görünür odak halkası.
  - Animasyonlarda sadece transform ve opacity; layout kayması (CLS) yok.
  - Ne ana sayfada ne örnek sitelerde konsol hatası olsun.

======================================================================
D. KABUL KRİTERLERİ (bitirince kendin test et)
======================================================================
Yerel sunucuyla (python3 -m http.server 8080) açıp Playwright ile ya da tarayıcıda 1440×900, 1024×768 ve 390×844 boyutlarında test et ve her maddeyi işaretle:
  [ ] Portfolyo: 6 kart var; tıklanan pasif kart ortaya kayıyor; sektör hapları, oklar ve klavye çalışıyor; mobilde parmakla kaydırma çalışıyor.
  [ ] A.1'deki hataların hepsi giderildi: ipucu çakışması yok, önizleme içeriği taşmıyor, tek "Siteyi gez" butonu var, boş daire kalmadı, pasif kartlar görünür.
  [ ] Aktif kartın önizlemesi gerçek örnek site; hover'da otomatik kayıyor; pasif kartlarda iframe yok.
  [ ] Tarayıcı modu: FLIP ile açılıyor; içerideki site tamamen gezilebiliyor; Masaüstü/Tablet/Mobil düğmeleri genişliği değiştiriyor ve site responsive tepki veriyor; ← → ile örnekler arasında geçiliyor; ✕ / Esc / perde / geri tuşu kapatıyor; #ornek/<sektor> adresiyle doğrudan açılıyor.
  [ ] Satış çubuğunda doğru sektörlü WhatsApp mesajı oluşuyor.
  [ ] 6 örnek sitenin her biri tek başına da (doğrudan dosyayı açınca) çalışıyor.
  [ ] 6 sitenin her biri birbirinden açıkça farklı görünüyor (yan yana ekran görüntüsü al ve karşılaştır).
  [ ] Her sitedeki tüm interaktif öğeler (sekme, filtre, lightbox, takvim, hesaplayıcı, sihirbaz, form doğrulama) çalışıyor; formlar örnek bildirimi gösteriyor ve hiçbir yere veri göndermiyor.
  [ ] 390 px'te hiçbir sayfada yatay taşma yok (scrollWidth === innerWidth).
  [ ] Lorem ipsum, gri boş kutu, "[Görsel]" yazısı ya da gerçek bir işletmeye ait isim/telefon yok.
  [ ] Konsolda hata yok.
Son olarak bana şunları ver: oluşturulan/değişen dosyaların listesi, her örnek site için kısa özet (renk, font, öne çıkan etkileşim), sonradan gerçek fotoğrafla değiştirilecek data-img alanlarının listesi.
