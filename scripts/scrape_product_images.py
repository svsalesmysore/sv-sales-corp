#!/usr/bin/env python3
"""
Scrapes real product photos from DuckDuckGo image search for all 193 products.

For each product it builds a smart query (brand + name), searches DDG images,
and downloads the first viable retail product photo. Falls back to a
category-level query when a specific product returns nothing usable.

Images are saved to public/products/<id>.jpg and a mapping is written to
src/data/product-images.json.

Usage:  python3 scripts/scrape_product_images.py
        python3 scripts/scrape_product_images.py --limit 10   # test run
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

# Preferred image hosts — clean catalog product shots from retailers/suppliers
PREFERRED_HOSTS = (
    "imimg.com", "media-amazon.com", "amazon.", "flipkart", "indiamart",
    "moglix", "industrybuying", "toolsvilla", "walmart", "homedepot",
    "thdstatic", "harborfreight", "grainger", "rsdelivers", "tradeindia",
)

# Category-level fallback queries
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


def rank(results):
    """Prefer trusted retail hosts, then larger images."""
    def score(r):
        host_bonus = 0
        img = r.get("image", "").lower()
        for h in PREFERRED_HOSTS:
            if h in img:
                host_bonus = 1000
                break
        area = (r.get("width", 0) or 0) * (r.get("height", 0) or 0)
        return host_bonus + min(area / 10000, 500)
    return sorted(results, key=score, reverse=True)


def download_valid_image(results, dest_path):
    """Try candidates until one downloads as a valid, reasonably-sized image."""
    for r in results[:8]:
        img_url = r.get("image")
        if not img_url:
            continue
        try:
            req = urllib.request.Request(img_url, headers={"User-Agent": UA})
            raw = urllib.request.urlopen(req, timeout=15).read()
            im = Image.open(BytesIO(raw))
            if im.width < 200 or im.height < 200:
                continue
            # Convert to RGB JPEG, cap at 800px on the long edge
            im = im.convert("RGB")
            longest = max(im.width, im.height)
            if longest > 800:
                scale = 800 / longest
                im = im.resize((int(im.width * scale), int(im.height * scale)))
            im.save(dest_path, "JPEG", quality=82)
            return img_url
        except Exception:
            continue
    return None


def build_query(p):
    name = p["name"]
    # strip size codes that confuse search (e.g. "CT-20", "6x7mm")
    clean = re.sub(r"\b[A-Z]{2}-\d+\b", "", name).strip()
    brand = p.get("brand", "")
    if brand and brand not in ("Unipatch",):  # Unipatch too niche; use generic
        return f"{brand} {clean}".strip()
    return clean


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
        print(f"[{i:3}/{len(products)}] {p['id'][:32]:32} ← \"{q[:40]}\"", end=" ", flush=True)

        results = rank(search_images(q))
        used = download_valid_image(results, dest) if results else None

        # fallback: category query
        if not used:
            time.sleep(1.0)
            cat_q = CATEGORY_QUERIES.get(p["categoryId"], "industrial tool")
            results = rank(search_images(cat_q))
            used = download_valid_image(results, dest) if results else None

        if used:
            mapping[p["id"]] = rel
            ok += 1
            print("✅")
        else:
            failed += 1
            print("❌ no image")

        time.sleep(1.2)  # throttle to avoid DDG rate-limiting

        # checkpoint mapping every 20
        if i % 20 == 0:
            with open(MAP_FILE, "w") as f:
                json.dump(mapping, f, indent=2)

    with open(MAP_FILE, "w") as f:
        json.dump(mapping, f, indent=2)
        f.write("\n")

    print(f"\n✅ {ok} images downloaded, ❌ {failed} failed")
    print(f"✅ Mapping written → {os.path.relpath(MAP_FILE, ROOT)}")


if __name__ == "__main__":
    main()
