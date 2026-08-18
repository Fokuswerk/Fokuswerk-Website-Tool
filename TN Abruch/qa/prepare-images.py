"""
Bildaufbereitung TN Abbruch.

Art Direction laut docs/02-creative-direction.md:
hoher Kontrast, leicht entsaettigt, kuehl abgestimmt, feines Korn.
Die Fotos werden nicht geschoenert — sie werden auf eine gemeinsame Anmutung gebracht.

Quelle: _research/assets/  ->  Ziel: src/assets/
"""
from PIL import Image, ImageEnhance, ImageOps, ImageChops
import numpy as np
import os

SRC = os.path.join(os.path.dirname(__file__), '..', '_research', 'assets')
AI = os.path.join(os.path.dirname(__file__), '..', '_research', 'ai')
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src', 'assets'))
os.makedirs(OUT, exist_ok=True)


def grade(im, *, contrast=1.14, saturation=0.62, cool=0.045, lift=0.012, grain=5.0):
    """Gemeinsame Bildanmutung fuer alle Fotos der Website."""
    im = im.convert('RGB')
    im = ImageEnhance.Color(im).enhance(saturation)
    im = ImageEnhance.Contrast(im).enhance(contrast)

    a = np.asarray(im).astype(np.float32) / 255.0

    # Kuehle Abstimmung: Blau leicht an, Rot leicht ab — Tageslicht auf Beton
    a[..., 2] = np.clip(a[..., 2] * (1 + cool), 0, 1)
    a[..., 0] = np.clip(a[..., 0] * (1 - cool * 0.55), 0, 1)

    # Tiefen minimal anheben, damit Schwarz nicht zuläuft (Filmkurve)
    a = a * (1 - lift) + lift

    # Feines Korn, gleichmaessig ueber alle Kanaele — deterministisch
    rng = np.random.default_rng(1997)
    noise = rng.normal(0, grain / 255.0, a.shape[:2])[..., None]
    a = np.clip(a + noise, 0, 1)

    return Image.fromarray((a * 255).astype(np.uint8))


def crop_ratio(im, ratio, anchor=0.5, vanchor=0.5):
    """Auf Seitenverhaeltnis beschneiden. anchor 0..1 = horizontale Bildmitte."""
    w, h = im.size
    target_h = w / ratio
    if target_h <= h:
        top = int((h - target_h) * vanchor)
        return im.crop((0, top, w, top + int(target_h)))
    target_w = h * ratio
    left = int((w - target_w) * anchor)
    return im.crop((left, 0, left + int(target_w), h))


def save(im, name, width=None, quality=92):
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, name)
    im.save(path, 'JPEG', quality=quality, optimize=True, progressive=True, subsampling=1)
    print(f'{name:44s} {im.width}x{im.height}  {os.path.getsize(path)//1024} KB')


# --- 1. Fuhrpark + Team, Betriebshof Delmenhorst, 2020 -----------------------
fp = Image.open(os.path.join(SRC, 'TN_Abbruch_2020_B.jpg'))
# Der untere Bildrand ist leerer Sandplatz — weg damit, die Masse steht oben.
fp = fp.crop((0, 0, fp.width, int(fp.height * 0.80)))
fp_g = grade(fp, contrast=1.18, saturation=0.55, grain=4.5)
save(crop_ratio(fp_g, 21 / 9, vanchor=0.35), 'fuhrpark-panorama.jpg', 2200)
save(crop_ratio(fp_g.crop((0, 0, int(fp_g.width * 0.42), fp_g.height)), 4 / 3, vanchor=0.3),
     'fuhrpark-maschinen.jpg', 1400)
save(crop_ratio(fp_g, 16 / 9, vanchor=0.3), 'fuhrpark-16x9.jpg', 1800)

# --- 2. Schadstoffsanierung KMF, Vollschutz nach TRGS 521 --------------------
ss = Image.open(os.path.join(SRC, 'TN_Abbruch_Unsere_Leistungen.jpg'))
ss_g = grade(ss, contrast=1.16, saturation=0.5, grain=5.5)
save(crop_ratio(ss_g, 4 / 5, anchor=0.42), 'schadstoffsanierung-hoch.jpg', 1100)
save(crop_ratio(ss_g, 16 / 9, vanchor=0.28), 'schadstoffsanierung-breit.jpg', 1800)
save(crop_ratio(ss_g, 3 / 2, anchor=0.45, vanchor=0.3), 'schadstoffsanierung-3x2.jpg', 1500)

# --- 3. KI-Materialstudie (kein Referenzprojekt, kein Ort, keine Zuordnung) --
ai_path = os.path.join(AI, 'test01.png')
if os.path.exists(ai_path):
    mat = grade(Image.open(ai_path), contrast=1.10, saturation=0.0, cool=0.06, grain=6.0)
    save(crop_ratio(mat, 21 / 9, vanchor=0.5), 'material-beton-bewehrung.jpg', 2000)
    save(crop_ratio(mat, 4 / 5, anchor=0.55), 'material-beton-hoch.jpg', 1000)

# --- 4. Nachweislogos: weissen Rand trimmen, auf helle Platte -----------------
for src_name, out_name in [('avn.png', 'logo-avn.png'),
                           ('nav.jpg', 'logo-nav.png'),
                           ('pq.png', 'logo-pq-vob.png')]:
    im = Image.open(os.path.join(SRC, src_name)).convert('RGB')
    bg = Image.new('RGB', im.size, im.getpixel((0, 0)))
    box = ImageChops.difference(im, bg).convert('L').point(lambda v: 255 if v > 12 else 0).getbbox()
    if box:
        im = im.crop(box)
    im = ImageOps.expand(im, border=max(4, im.width // 40), fill=im.getpixel((0, 0)))
    if im.width > 520:
        im = im.resize((520, round(im.height * 520 / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, out_name)
    im.save(p, 'PNG', optimize=True)
    print(f'{out_name:44s} {im.width}x{im.height}  {os.path.getsize(p)//1024} KB')
