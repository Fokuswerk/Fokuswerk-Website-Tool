"""Ratgeber-Artikel (Markdown + Frontmatter) in eine JSON-Datei für den Framer-CMS-Import umwandeln.

Aufruf: python3 Ratgeber/_import.py  →  schreibt /tmp/fw_ratgeber_import.json
Der Framer-Import liest diese Datei (fs ist in framer exec auf /tmp begrenzt).
"""
import glob, json, os, re
import yaml

HIER = os.path.dirname(os.path.abspath(__file__))
BASIS = "https://fokuswerk.de"
OG = "https://framerusercontent.com/images/KPQYvEbz6FLTUp0yerEjNGU84g0.png"
ORG = f"{BASIS}/#organisation"
REIHENFOLGE = [  # Anzeige in der Übersicht: stärkste Themen zuerst, Kategorien gemischt
    "online-marketing-kleine-unternehmen", "was-kostet-eine-website", "google-ads-kosten", "google-unternehmensprofil",
    "social-recruiting", "meta-ads", "local-seo", "google-bewertung-loeschen", "landingpage",
    "social-media-fuer-unternehmen", "in-chatgpt-gefunden-werden", "google-analytics-4",
    "instagram-facebook-werbung-kosten", "was-ist-performance-marketing", "datenschutzerklaerung-impressum",
    "mfa-zfa-finden", "website-relaunch", "zielgruppe-definieren", "seo-fuer-handwerker", "imagefilm-kosten",
    "conversion-rate-optimierung", "barrierefreie-website", "mitarbeiter-finden-handwerk", "cookie-banner",
    "seo-fuer-zahnaerzte", "newsletter-marketing", "meta-pixel-conversions-api", "retargeting",
    "website-mieten-oder-kaufen", "leadgenerierung", "tiktok-fuer-unternehmen", "google-ads-agentur-finden",
    "framer-website",
]


def lesen(pfad):
    s = open(pfad, encoding="utf-8").read()
    _, fm, body = s.split("---", 2)
    return yaml.safe_load(fm), body.strip()


def inhalt(d, body):
    faq = "\n\n".join(f"### {f['frage']}\n\n{f['antwort']}" for f in d.get("faq") or [])
    block = f"## Häufige Fragen\n\n{faq}"
    # Fragen vor den Schlussabschnitt „Nächster Schritt“ stellen
    m = re.search(r"^## Nächster Schritt", body, flags=re.M)
    body = body[: m.start()] + block + "\n\n" + body[m.start():] if m else body + "\n\n" + block
    q = d.get("quellen") or []
    if q:
        body += "\n\n## Quellen\n\n" + "\n".join(f"- [{x['titel']}]({x['url']})" for x in q)
    return body


def schema(d):
    url = f"{BASIS}/ratgeber/{d['slug']}"
    autor_url = f"{BASIS}/agentur"
    graph = [
        {
            "@type": "BlogPosting",
            "@id": f"{url}#artikel",
            "headline": d["titel"],
            "description": d["beschreibung"],
            "datePublished": str(d["datum"]),
            "dateModified": str(d["datum"]),
            "inLanguage": "de-DE",
            "mainEntityOfPage": url,
            "image": OG,
            "articleSection": d["kategorie"],
            "keywords": [d["hauptkeyword"], *d.get("nebenkeywords", [])],
            "author": {"@type": "Person", "name": d["autor"], "url": autor_url, "worksFor": {"@id": ORG}},
            "publisher": {"@id": ORG},
        },
        {
            "@type": "FAQPage",
            "@id": f"{url}#faq",
            "mainEntity": [
                {"@type": "Question", "name": f["frage"], "acceptedAnswer": {"@type": "Answer", "text": f["antwort"]}}
                for f in d.get("faq") or []
            ],
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Startseite", "item": f"{BASIS}/"},
                {"@type": "ListItem", "position": 2, "name": "Ratgeber", "item": f"{BASIS}/ratgeber"},
                {"@type": "ListItem", "position": 3, "name": d["titel"], "item": url},
            ],
        },
    ]
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)


artikel = {}
for p in glob.glob(os.path.join(HIER, "*.md")):
    if os.path.basename(p).startswith("_"):
        continue
    d, body = lesen(p)
    artikel[d["slug"]] = {
        "slug": d["slug"],
        "titel": d["titel"],
        "kategorie": d["kategorie"],
        "beschreibung": d["beschreibung"],
        "kurzantwort": d["kurzantwort"],
        "inhalt": inhalt(d, body),
        "autor": d["autor"],
        "datum": f"{d['datum']}T00:00:00.000Z",
        "lesezeit": f"{d['lesezeit']} Min. Lesezeit",
        "seo": d["seoTitel"],
        "json": schema(d),
    }
fehlt = set(artikel) - set(REIHENFOLGE)
reihe = [artikel[s] for s in REIHENFOLGE if s in artikel] + [artikel[s] for s in sorted(fehlt)]
json.dump(reihe, open("/tmp/fw_ratgeber_import.json", "w", encoding="utf-8"), ensure_ascii=False)
print(len(reihe), "Artikel →", "/tmp/fw_ratgeber_import.json")
