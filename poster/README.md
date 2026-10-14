# THE GRACE — Afiş

| Dosya | Görev |
| --- | --- |
| `poster.html` | Afişin kaynağı (1200×1500, 4:5). Fontlar: Bodoni Moda (marka adı), Jost ultra-light (atölye satırı, liste, künye), Cormorant Garamond light (slogan). |
| `the-grace-poster.png` | 2400×3000 baskı/paylaşım çıktısı |
| `portrait-original.jpg` | Orijinal fotoğraf |
| `portrait.jpg` | Çene hattı yumuşatılmış fotoğraf (`soften-jaw.py` ile üretilir) |

```bash
python3 poster/soften-jaw.py poster/portrait-original.jpg poster/portrait.jpg
node poster/render.mjs   # playwright gerekir (npm i -D playwright)
```

Fotoğraf `mix-blend-mode: multiply` ile basılır: beyaz perdeler altın "THE GRACE" yazısını gösterir, saçlar ise örter; böylece "R" ve "A" harfleri başın arkasından geçiyormuş gibi görünür.
