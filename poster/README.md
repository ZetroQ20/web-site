# THE GRACE — Afiş

Koyu zemin + altın varak, 1200×1560 (render: 2400×3120 PNG).

| Dosya | Görev |
| --- | --- |
| `poster.html` | Afişin kaynağı. Fontlar: Cinzel (başlık, slogan, liste, künye — sitedeki marka fontu), Jost (küçük İngilizce satır, Instagram) |
| `the-grace-poster.png` | Baskı / paylaşım çıktısı |
| `portrait-original.jpg` | Orijinal fotoğraf |
| `portrait.jpg` | Çene hattı yuvarlatılmış fotoğraf (`soften-jaw.py`) |
| `portrait-crop.jpg`, `portrait-hair.png` | Afiş kırpımı ve "R"/"A" harflerinin arkasına geçtiği saç katmanı (`make-layers.py`) |

```bash
cd poster
python3 soften-jaw.py portrait-original.jpg portrait.jpg
python3 make-layers.py portrait.jpg
node render.mjs          # playwright gerekir (npm i -D playwright)
```
