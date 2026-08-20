"""
FOKUSWERK. Logo — präzise Extraktion mit bekannten Koordinaten
Text liegt bei x:97-445, y:726-750 im 800x800 Source-Bild
"""
from PIL import Image, ImageFilter
import numpy as np

SRC = "/Users/thees/Desktop/Fokuswerk/Ads/Creative/1.png"
OUT = "/Users/thees/Desktop/Claude/fokuswerk-ads/creatives/"

img  = Image.open(SRC).convert("RGB")

# Crop mit Padding
PAD  = 8
crop = img.crop((97 - PAD, 726 - PAD, 445 + PAD, 750 + PAD))
arr  = np.array(crop)
r, g, b = arr[...,0].astype(int), arr[...,1].astype(int), arr[...,2].astype(int)

# Alpha: pure white = hoch, orange/gradient = niedrig
# Nutze min(G,B) - funktioniert weil Orange G~80,B~8 aber Weiß G=255,B=255
min_gb  = np.minimum(g, b)
alpha   = np.clip((min_gb - 100) * 4, 0, 255).astype(np.uint8)

def save(color, name):
    rgba = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    rgba[..., :3] = color
    rgba[..., 3]  = alpha
    logo = Image.fromarray(rgba)
    # 10x upscale für Schärfe
    logo = logo.resize((logo.width * 10, logo.height * 10), Image.LANCZOS)
    logo.save(OUT + name)
    print(f"✓ {name}  {logo.size}")

save((255, 255, 255), "logo_white.png")
save((28,  28,  28),  "logo_dark.png")
