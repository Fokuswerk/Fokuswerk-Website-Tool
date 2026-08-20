"""
Fokuswerk — Ad Creative Generator v2
Mit echtem FOKUSWERK. Logo
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT      = "/Users/thees/Desktop/Claude/fokuswerk-ads/creatives"
LOGO_W   = Image.open(os.path.join(OUT, "logo_white.png")).convert("RGBA")
LOGO_D   = Image.open(os.path.join(OUT, "logo_dark.png")).convert("RGBA")

FONT     = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_SF  = "/System/Library/Fonts/SFNS.ttf"

def font(size, bold=False):
    try:
        return ImageFont.truetype(FONT, size, index=1 if bold else 0)
    except Exception:
        return ImageFont.truetype(FONT_SF, size)

def paste_logo(canvas, logo_src, x, y, target_w):
    """Logo proportional einfügen."""
    ratio  = target_w / logo_src.width
    new_h  = int(logo_src.height * ratio)
    logo   = logo_src.resize((target_w, new_h), Image.LANCZOS)
    canvas.paste(logo, (x, y), logo)
    return new_h

def tw(draw, text, fnt):
    bb = draw.textbbox((0,0), text, font=fnt)
    return bb[2] - bb[0]

def ml(draw, text, x, y, fnt, fill, lh_mult=1.55):
    for line in text.split("\n"):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += int(fnt.size * lh_mult)
    return y


# ════════════════════════════════════════════════════════════
# CREATIVE 01 — Reel 4:5 (1080x1350) · "Niemand kennt euch"
# ════════════════════════════════════════════════════════════
def creative_01():
    W, H = 1080, 1350
    img  = Image.new("RGB", (W, H), "#111111")
    d    = ImageDraw.Draw(img)
    PAD  = 72

    # Faint FW watermark
    fnt_wm = font(420, bold=True)
    d.text((560, 860), "FW", font=fnt_wm, fill="#191919")

    # Orange accent bar oben
    d.rectangle([0, 0, W, 7], fill="#FF5500")

    # Logo oben links (weiß, 200px breit)
    paste_logo(img, LOGO_W, PAD, PAD + 4, 220)

    # Eyebrow
    fnt_eye = font(20, bold=True)
    d.text((PAD, 188), "FUER KMU IN OLDENBURG & BREMEN", font=fnt_eye, fill="#3A3A3A")

    # Headline — zweifarbig
    fnt_hl = font(104, bold=True)
    fnt_hr = font(104, bold=False)
    lines = [
        ("Niemand",           fnt_hl, "#FFFFFF"),
        ("kennt euch --",     fnt_hl, "#FFFFFF"),
        ("obwohl ihr",        fnt_hr, "#555555"),
        ("gut seid.",         fnt_hr, "#555555"),
    ]
    y = 256
    for text, f, col in lines:
        d.text((PAD, y), text, font=f, fill=col)
        y += 116

    # Divider
    d.rectangle([PAD, y + 16, PAD + 52, y + 19], fill="#FF5500")
    y += 52

    # Body
    fnt_b = font(30)
    body = "Das ist kein Kreativ-Problem.\nDas ist ein System-Problem.\nWir loesen es."
    ml(d, body, PAD, y + 8, fnt_b, "#5A5A5A")

    # CTA Button
    btn_y, btn_w = H - 132, 560
    d.rectangle([PAD, btn_y, PAD + btn_w, btn_y + 64], fill="#FFFFFF")
    fnt_cta = font(19, bold=True)
    cta = "KOSTENLOSES ERSTGESPRAECH BUCHEN"
    d.text((PAD + (btn_w - tw(d, cta, fnt_cta)) // 2, btn_y + 20), cta, font=fnt_cta, fill="#111111")

    fnt_url = font(22)
    d.text((PAD + btn_w + 24, btn_y + 20), "fokuswerk.de", font=fnt_url, fill="#333333")

    path = os.path.join(OUT, "creative_01_reel_4x5.png")
    img.save(path, "PNG", optimize=True)
    print(f"  Creative 01: {path}")


# ════════════════════════════════════════════════════════════
# CREATIVE 02 — Static 1:1 (1080x1080) · Social Proof Zahlen
# ════════════════════════════════════════════════════════════
def creative_02():
    W, H = 1080, 1080
    img  = Image.new("RGB", (W, H), "#FFFFFF")
    d    = ImageDraw.Draw(img)
    PAD  = 72

    # Orange Top-Bar
    d.rectangle([0, 0, W, 8], fill="#FF5500")

    # Logo oben links (dunkel, 180px breit)
    paste_logo(img, LOGO_D, PAD, PAD + 6, 200)

    # Tag oben rechts
    fnt_tag = font(17, bold=True)
    tag = "KUNDENERGEBNIS"
    tw_ = tw(d, tag, fnt_tag)
    d.rectangle([W - PAD - tw_ - 28, PAD + 6, W - PAD, PAD + 44], fill="#111111")
    d.text((W - PAD - tw_ - 14, PAD + 11), tag, font=fnt_tag, fill="#FFFFFF")

    # Stats
    stats = [("+957%", "Mehr\nReichweite"), ("84K", "Views in\n30 Tagen"), ("5,0 *", "Google\nBewertung")]
    sx, sy, col_w = PAD, 196, (W - 2 * PAD) // 3
    fnt_num = font(76, bold=True)
    fnt_lbl = font(22)
    for i, (num, lbl) in enumerate(stats):
        x = sx + i * col_w
        d.text((x, sy), num, font=fnt_num, fill="#111111")
        ml(d, lbl, x, sy + 92, fnt_lbl, "#999999")

    # Divider
    d.rectangle([PAD, 376, W - PAD, 377], fill="#EBEBEB")

    # Orange Accent-Linie
    d.rectangle([PAD, 378, PAD + 48, 382], fill="#FF5500")

    # Headline
    fnt_hl = font(70, bold=True)
    hl_y   = 406
    for line in ["Mehr Kunden ueber", "Social Media.", "Mit System."]:
        d.text((PAD, hl_y), line, font=fnt_hl, fill="#111111")
        hl_y += 80

    # Sub
    fnt_sub = font(28)
    ml(d, "Content-Strategie & Produktion fuer KMU\nin Oldenburg & Bremen.", PAD, hl_y + 14, fnt_sub, "#999999")

    # Divider
    d.rectangle([PAD, H - 128, W - PAD, H - 127], fill="#EBEBEB")

    # CTA
    btn_y, btn_w = H - 108, 420
    d.rectangle([PAD, btn_y, PAD + btn_w, btn_y + 56], fill="#111111")
    fnt_cta = font(18, bold=True)
    cta = "KOSTENLOSES ERSTGESPRAECH"
    d.text((PAD + (btn_w - tw(d, cta, fnt_cta)) // 2, btn_y + 17), cta, font=fnt_cta, fill="#FFFFFF")

    fnt_url = font(22)
    d.text((PAD + btn_w + 28, btn_y + 18), "fokuswerk.de", font=fnt_url, fill="#BBBBBB")

    path = os.path.join(OUT, "creative_02_static_1x1_zahlen.png")
    img.save(path, "PNG", optimize=True)
    print(f"  Creative 02: {path}")


# ════════════════════════════════════════════════════════════
# CREATIVE 03 — Carousel Karte 1 (1080x1080) · Konkurrenz
# ════════════════════════════════════════════════════════════
def creative_03():
    W, H = 1080, 1080
    img  = Image.new("RGB", (W, H), "#111111")
    d    = ImageDraw.Draw(img)
    PAD  = 72

    # Ghost number
    fnt_ghost = font(340, bold=True)
    d.text((-24, H - 360), "01", font=fnt_ghost, fill="#1A1A1A")

    # Orange Accent-Bar links
    d.rectangle([0, 0, 6, H], fill="#FF5500")

    # Logo oben links (weiß, 200px breit)
    paste_logo(img, LOGO_W, PAD + 8, PAD + 4, 200)

    # Eyebrow
    fnt_eye = font(20, bold=True)
    d.text((PAD + 8, 200), "DIE UNBEQUEME WAHRHEIT", font=fnt_eye, fill="#444444")

    # Headline
    fnt_hb = font(82, bold=True)
    fnt_hr = font(82, bold=False)
    lines = [
        ("Eure Konkurrenz",       fnt_hb, "#FFFFFF"),
        ("ist ueberall",          fnt_hb, "#FFFFFF"),
        ("auf Social Media.",     fnt_hr, "#444444"),
    ]
    y = 258
    for text, f, col in lines:
        d.text((PAD + 8, y), text, font=f, fill=col)
        y += 94

    # Body
    fnt_b = font(32)
    body = "Nicht weil die mehr Zeit haben --\nsondern weil die ein System haben.\n\nWischen fuer die Loesung >"
    ml(d, body, PAD + 8, y + 28, fnt_b, "#555555", lh_mult=1.65)

    # Dots
    dot_y = H - 72
    dot_configs = [(True, 22), (False, 8), (False, 8), (False, 8), (False, 8)]
    dx = W - PAD
    for active, size in reversed(dot_configs):
        if active:
            d.rectangle([dx - 28, dot_y - 7, dx, dot_y + 7], fill="#FFFFFF")
            dx -= 44
        else:
            d.ellipse([dx - size, dot_y - size, dx, dot_y], fill="#333333")
            dx -= 22

    fnt_swipe = font(20, bold=True)
    d.text((PAD + 8, dot_y - 12), "WEITER WISCHEN  >", font=fnt_swipe, fill="#333333")

    path = os.path.join(OUT, "creative_03_carousel_karte1.png")
    img.save(path, "PNG", optimize=True)
    print(f"  Creative 03: {path}")


if __name__ == "__main__":
    print("Generiere Fokuswerk Ad Creatives...")
    creative_01()
    creative_02()
    creative_03()
    print("\nFertig. Dateien unter:", OUT)
