#!/usr/bin/env python3
"""
v2 product-image scraper — stricter accuracy at 480-800px.

Improvements over v1:
  1. Category-context word appended to EVERY query (disambiguation) — prevents
     "Tube Neck" -> dress, "Emergency Bend Neck" -> person, etc.
  2. Title-relevance ranking — prefers results whose title shares words with the
     product name, not just a matching host.
  3. Min-resolution floor raised to 480px on the long edge (was 200px).
  4. Keeps native resolution up to 800px (no upscaling, only downscale if larger).

Usage:  python3 scripts/scrape_product_images_v2.py
        python3 scripts/scrape_product_images_v2.py --limit 10
        PRODUCTS_JSON=/tmp/x.json python3 scripts/scrape_product_images_v2.py
"""

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from io import BytesIO

try:
    from PIL import Image
except ImportError:
    print("Pillow required:  pip3 install --break-system-packages Pillow")
    sys.exit(1)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PRODUCTS_JSON = os.environ.get("PRODUCTS_JSON", "/tmp/products.json")
OUT_DIR = os.path.join(ROOT, "public", "products")
MAP_FILE = os.path.join(ROOT, "src", "data", "product-images.json")

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

PREFERRED_HOSTS = (
    "imimg.com", "media-amazon.com", "amazon.", "flipkart", "indiamart",
    "moglix", "industrybuying", "toolsvilla", "walmart", "homedepot",
    "thdstatic", "harborfreight", "grainger", "rsdelivers", "tradeindia",
    "rukminim",  # flipkart CDN
)

# Domain word appended to every query so search can't drift off-topic.
CATEGORY_CONTEXT = {
    "tyre-repair":         "tyre",
    "spanners-wrenches":   "spanner tool",
    "sockets-drives":      "socket tool",
    "pliers-screwdrivers": "hand tool",
    "jacks-lifting":       "hydraulic jack",
    "pneumatic-air":       "pneumatic tool",
    "grease-lubrication":  "grease tool",
    "welding":             "welding",
    "painting-surface":    "paint tool",
    "fastening-clamping":  "workshop tool",
    "electrical-fans":     "industrial",
    "safety-protective":   "industrial safety",
    "sealing-adhesives":   "industrial",
    "miscellaneous":       "industrial tool",
}

# Category-level fallback queries when a specific product yields nothing usable.
CATEGORY_QUERIES = {
    "tyre-repair":         "tyre retreading tool",
    "spanners-wrenches":   "spanner wrench tool",
    "sockets-drives":      "socket wrench set",
    "pliers-screwdrivers": "pliers hand tool",
    "jacks-lifting":       "hydraulic jack",
    "pneumatic-air":       "pneumatic air tool",
    "grease-lubrication":  "grease gun",
    "welding":             "welding equipment",
    "painting-surface":    "spray paint gun",
    "fastening-clamping":  "c clamp tool",
    "electrical-fans":     "industrial fan",
    "safety-protective":   "safety gloves",
    "sealing-adhesives":   "sealant tube",
    "miscellaneous":       "industrial workshop tool",
}

STOPWORDS = {"and", "the", "for", "with", "set", "of", "to", "cum", "per", "no"}


def get_vqd(query):
    enc = urllib.parse.quote(query)
    req = urllib.request.Request(
        f"https://duckduckgo.com/?q={enc}&iax=images&ia=images",
        headers={"User-Agent": UA},
    )
    html = urllib.request.urlopen(req, timeout=15).read().decode("utf-8", "ignore")
    m = re.search(r'vqd="([^"]+)"', html) or re.search(r"vqd=['\"]?([0-9-]+)", html)
    return m.group(1) if m else None


def search_images(query):
    vqd = get_vqd(query)
    if not vqd:
        return []
    time.sleep(0.6)
    enc = urllib.parse.quote(query)
    url = f"https://duckduckgo.com/i.js?l=us-en&o=json&q={enc}&vqd={vqd}&f=,,,&p=1"
    req = urllib.request.Request(
        url, headers={"User-Agent": UA, "Referer": "https://duckduckgo.com/"}
    )
    try:
        data = json.loads(urllib.request.urlopen(req, timeout=15).read())
    except Exception:
        return []
    return data.get("results", [])


def name_words(name):
    words = re.findall(r"[a-zA-Z]+", name.lower())
    return {w for w in words if w not in STOPWORDS and len(w) > 2}


def rank(results, product_name):
    """Rank by: host trust + title word-overlap with product name + image area."""
    pwords = name_words(product_name)

    def score(r):
        s = 0.0
        img = (r.get("image") or "").lower()
        for h in PREFERRED_HOSTS:
            if h in img:
                s += 1000
                break
        # title relevance — overlap of product words with result title
        title = (r.get("title") or "").lower()
        twords = set(re.findall(r"[a-zA-Z]+", title))
        overlap = len(pwords & twords)
        s += overlap * 300
        area = (r.get("width", 0) or 0) * (r.get("height", 0) or 0)
        s += min(area / 10000, 400)
        return s

    return sorted(results, key=score, reverse=True)


def download_valid_image(results, dest_path):
    """Download first candidate that is a valid image >=480px on the long edge."""
    for r in results[:10]:
        img_url = r.get("image")
        if not img_url:
            continue
        try:
            req = urllib.request.Request(img_url, headers={"User-Agent": UA})
            raw = urllib.request.urlopen(req, timeout=15).read()
            im = Image.open(BytesIO(raw))
            longest = max(im.width, im.height)
            if longest < 480:  # too low-res for 480-720p target
                continue
            im = im.convert("RGB")
            if longest > 800:
                scale = 800 / longest
                im = im.resize((int(im.width * scale), int(im.height * scale)))
            im.save(dest_path, "JPEG", quality=85)
            return img_url
        except Exception:
            continue
    return None


def build_query(p):
    name = p["name"]
    # drop only parenthetical notes and trailing measurement clutter, keep model codes
    clean = re.sub(r"\([^)]*\)", "", name).strip()
    brand = p.get("brand", "")
    context = CATEGORY_CONTEXT.get(p["categoryId"], "tool")
    parts = []
    if brand and brand != "Unipatch":  # Unipatch listings sparse; rely on name+context
        parts.append(brand)
    parts.append(clean)
    parts.append(context)
    return " ".join(parts).strip()


def main():
    limit = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])

    with open(PRODUCTS_JSON) as f:
        products = json.load(f)
    if limit:
        products = products[:limit]

    os.makedirs(OUT_DIR, exist_ok=True)
    mapping = {}
    ok, failed = 0, 0

    for i, p in enumerate(products, 1):
        dest = os.path.join(OUT_DIR, f"{p['id']}.jpg")
        rel = f"/products/{p['id']}.jpg"
        q = build_query(p)
        print(f"[{i:3}/{len(products)}] {p['id'][:30]:30} ← \"{q[:46]}\"", end=" ", flush=True)

        results = rank(search_images(q), p["name"])
        used = download_valid_image(results, dest) if results else None

        if not used:  # fallback to category query
            time.sleep(1.0)
            cat_q = CATEGORY_QUERIES.get(p["categoryId"], "industrial tool")
            results = rank(search_images(cat_q), p["name"])
            used = download_valid_image(results, dest) if results else None

        if used:
            mapping[p["id"]] = rel
            ok += 1
            print("✅")
        else:
            failed += 1
            print("❌")

        time.sleep(1.2)
        if i % 20 == 0:
            with open(MAP_FILE, "w") as f:
                json.dump(mapping, f, indent=2)

    # keep any pre-existing mapping entries for products we didn't rescrape
    if os.path.exists(MAP_FILE):
        try:
            existing = json.load(open(MAP_FILE))
        except Exception:
            existing = {}
    else:
        existing = {}
    existing.update(mapping)

    with open(MAP_FILE, "w") as f:
        json.dump(existing, f, indent=2)
        f.write("\n")

    print(f"\n✅ {ok} downloaded, ❌ {failed} failed")
    print(f"✅ Mapping → {os.path.relpath(MAP_FILE, ROOT)}")


if __name__ == "__main__":
    main()
