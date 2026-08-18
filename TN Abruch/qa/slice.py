"""Screenshot in lesbare Streifen zerlegen: python3 qa/slice.py <datei> [streifenhoehe]"""
import sys, os
from PIL import Image
src = sys.argv[1]
step = int(sys.argv[2]) if len(sys.argv) > 2 else 2200
im = Image.open(src)
out = os.path.join(os.path.dirname(src), 'slices')
os.makedirs(out, exist_ok=True)
base = os.path.splitext(os.path.basename(src))[0]
for f in os.listdir(out):
    if f.startswith(base + '--'):
        os.remove(os.path.join(out, f))
w = 760 if im.width > 760 else im.width
for i, y in enumerate(range(0, im.height, step)):
    h = min(step, im.height - y)
    im.crop((0, y, im.width, y + h)).resize((w, max(1, round(h * w / im.width)))).save(f'{out}/{base}--{i}.png')
    print(f'{out}/{base}--{i}.png')
