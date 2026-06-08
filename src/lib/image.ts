/**
 * Product image resolution.
 *
 * Real product photos are scraped once via scripts/scrape_product_images.py
 * and stored under public/products/<id>.jpg. The id→path mapping lives in
 * product-images.json. At runtime we just look up the local path — fast,
 * offline, no external requests.
 *
 * Products without a scraped image (or whose image failed review) fall back
 * to a clean branded placeholder.
 */
import productImages from '@/data/product-images.json'

const MAP = productImages as Record<string, string>

const PLACEHOLDER = '/products/_placeholder.svg'

/** Local path to a product's photo, or a branded placeholder if none exists. */
export function getProductImage(productId: string): string {
  return MAP[productId] ?? PLACEHOLDER
}

/** Generic fallback used by <Image onError>. */
export function getFallbackImage(): string {
  return PLACEHOLDER
}
