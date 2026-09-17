#!/usr/bin/env python3
"""Inject the shared footer and JSON-LD structured data into every page as static HTML.

Why static: Googlebot renders JavaScript on a second, lower-priority pass. Footer
service-area text, NAP details and schema.org data are ranking signals, so they
belong in the raw HTML, not in site.js. Run this after editing any FAQ or the
footer template below:

    python3 tools/build-static.py

Idempotent: content between the marker comments is replaced on every run.
"""
import datetime
import json
import re
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://sleepanaesthesia.com.au/"
TODAY = datetime.date.today().isoformat()

PAGES = {
    "index.html": None,
    "patients.html": "Patients",
    "clinics.html": "Dental Clinics",
    "general-anaesthesia.html": "General Anaesthesia",
    "pricing.html": "Pricing & Payment Plans",
    "contact.html": "Contact",
    "portal.html": "Dental Portal",
}

ORG = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": BASE + "#organization",
    "name": "Sleep Anaesthesia",
    "url": BASE,
    "logo": BASE + "uploads/sleep-anaesthesia-logo.png",
    "image": BASE + "uploads/og-sleep-anaesthesia.jpg",
    "telephone": "+61485692397",
    "email": "admin@sleepanaesthesia.com.au",
    "description": "Mobile IV sedation and general anaesthesia for dental clinics, delivered by FANZCA specialist anaesthetists with hospital-grade equipment. Brisbane, Gold Coast, Sunshine Coast and Melbourne.",
    "medicalSpecialty": "Anesthesia",
    # Service-area business: no public street address, region only.
    "address": {"@type": "PostalAddress", "addressLocality": "Brisbane", "addressRegion": "QLD", "addressCountry": "AU"},
    "areaServed": [
        {"@type": "City", "name": "Brisbane"},
        {"@type": "City", "name": "Gold Coast"},
        {"@type": "City", "name": "Sunshine Coast"},
        {"@type": "City", "name": "Melbourne"},
    ],
    "sameAs": ["https://instagram.com/sleepanaesthesia"],
}

FOOTER = """<!-- footer:start -->
<footer class="footer">
  <div class="wrap">
    <div>
      <a class="nav-brand" href="index.html" style="display:inline-flex;align-items:center;gap:10px;font-family:var(--font-heading);font-weight:var(--font-heading-weight);font-size:18px;text-decoration:none;color:inherit;"><img class="brand-mark" src="uploads/sleep-anaesthesia-logo-light.png" width="56" height="47" loading="lazy" alt="Sleep Anaesthesia logo" /><span>Sleep Anaesthesia</span></a>
      <p class="about" style="margin-top:14px;">Mobile dental sedation and general anaesthesia by FANZCA specialist anaesthetists, delivered at dental clinics across Brisbane, the Gold Coast, the Sunshine Coast and Melbourne.</p>
      <p class="about" style="margin-top:6px;">Medicare rebates processed for patients. Afterpay available in 4 instalments.</p>
    </div>
    <div>
      <h4>Services</h4>
      <ul>
        <li><a href="patients.html">Sleep dentistry for patients</a></li>
        <li><a href="clinics.html">Mobile IV sedation for dental clinics</a></li>
        <li><a href="general-anaesthesia.html">Mobile general anaesthesia</a></li>
        <li><a href="pricing.html">Dental sedation cost &amp; payment plans</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="portal.html">Dental portal</a></li>
      </ul>
    </div>
    <div>
      <h4>Contact</h4>
      <ul>
        <li><a href="tel:+61485692397">0485 692 397</a></li>
        <li><a href="mailto:admin@sleepanaesthesia.com.au">admin@sleepanaesthesia.com.au</a></li>
        <li><a href="https://instagram.com/sleepanaesthesia" target="_blank" rel="noopener">Instagram — @sleepanaesthesia</a></li>
        <li><a href="index.html#areas">Brisbane · Gold Coast · Sunshine Coast · Melbourne</a></li>
      </ul>
    </div>
    <div class="legal">
      <span>© Sleep Anaesthesia — ANZCA-accredited specialist anaesthetists. Mobile service, Queensland &amp; Victoria.</span>
      <span class="disclaimer">Any surgical or invasive procedure carries risks. Before proceeding, you should seek a second opinion from an appropriately qualified health practitioner.</span>
    </div>
  </div>
</footer>
<!-- footer:end -->"""


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + "</script>"


def strip_tags(html):
    return unescape(re.sub(r"<[^>]+>", "", html)).strip()


def faq_schema(html):
    items = []
    for m in re.finditer(r'<details class="qa"(?![^>]*\brate\b)[^>]*>\s*<summary>(.*?)</summary>\s*<div class="qa-body">(.*?)</div>\s*</details>', html, re.S):
        q = re.sub(r'<span class="qa-(cat|mark)">.*?</span>', "", m.group(1), flags=re.S)
        a = re.sub(r"</(p|li)>", " ", m.group(2))
        items.append({"@type": "Question", "name": strip_tags(q), "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"\s+", " ", strip_tags(a))}})
    if not items:
        return None
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": items}


def build(page, crumb):
    path = ROOT / page
    html = path.read_text()

    html = html.replace('<html lang="en">', '<html lang="en-AU">', 1)

    # og:image + large card, once per page
    if "og:image" not in html:
        html = html.replace(
            '<meta property="og:locale" content="en_AU" />',
            '<meta property="og:image" content="' + BASE + 'uploads/og-sleep-anaesthesia.jpg" />\n'
            '<meta property="og:image:width" content="1200" />\n<meta property="og:image:height" content="630" />\n'
            '<meta property="og:locale" content="en_AU" />', 1)
    html = html.replace('<meta name="twitter:card" content="summary" />', '<meta name="twitter:card" content="summary_large_image" />')

    # structured data
    blocks = [ld(ORG)]
    if crumb:
        blocks.append(ld({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": crumb, "item": BASE + page}]}))
    faq = faq_schema(html) if page != "portal.html" else None
    if faq:
        blocks.append(ld(faq))
    schema = "<!-- schema:start -->\n" + "\n".join(blocks) + "\n<!-- schema:end -->"
    if "<!-- schema:start -->" in html:
        html = re.sub(r"<!-- schema:start -->.*?<!-- schema:end -->", lambda _: schema, html, flags=re.S)
    elif "<!--SCHEMA-->" in html:
        html = html.replace("<!--SCHEMA-->", schema, 1)
    else:
        html = html.replace("</head>", schema + "\n</head>", 1)

    # footer
    if "<!-- footer:start -->" in html:
        html = re.sub(r"<!-- footer:start -->.*?<!-- footer:end -->", lambda _: FOOTER, html, flags=re.S)
    elif "<!--FOOTER-->" in html:
        html = html.replace("<!--FOOTER-->", FOOTER, 1)
    else:
        html = html.replace('<script src="image-slot.js"></script>', FOOTER + '\n<script src="image-slot.js"></script>', 1)

    path.write_text(html)
    return len(faq["mainEntity"]) if faq else 0


def sitemap():
    urls = [p for p in PAGES if p != "portal.html"]
    body = "\n".join(
        f"  <url><loc>{BASE}{'' if p == 'index.html' else p}</loc><lastmod>{TODAY}</lastmod></url>" for p in urls)
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "\n</urlset>\n")


if __name__ == "__main__":
    for page, crumb in PAGES.items():
        n = build(page, crumb)
        print(f"{page:28s} footer + schema{' + FAQPage(' + str(n) + ')' if n else ''}")
    sitemap()
    print("sitemap.xml updated", TODAY)
