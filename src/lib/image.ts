/**
 * Product image utilities.
 * Uses loremflickr.com — no API key, real Flickr photos.
 *
 * Strategy: use tested category-level keywords (guaranteed to have Flickr coverage)
 * combined with a per-product numeric seed so each product gets a different photo
 * within the same relevant visual domain.
 */

/**
 * Tested, working loremflickr keywords for each product category.
 * Every entry was verified to return a real photo (not defaultImage) in June 2026.
 */
const CATEGORY_KEYWORDS: Record<string, string> = {
  'tyre-repair':         'tire,wheel,repair',
  'spanners-wrenches':   'wrench,spanner,tool',
  'sockets-drives':      'socket,ratchet',
  'pliers-screwdrivers': 'pliers,screwdriver,tool',
  'jacks-lifting':       'jack,car,hydraulic',
  'pneumatic-air':       'compressor,pneumatic,air',
  'grease-lubrication':  'grease,lubrication',
  'welding':             'welding,welder',
  'painting-surface':    'spray,paint,automotive',
  'fastening-clamping':  'clamp,fastener',
  'electrical-fans':     'industrial,fan,workshop',
  'safety-protective':   'safety,gloves,ppe',
  'sealing-adhesives':   'sealant,adhesive',
  'miscellaneous':       'bearing,industrial,workshop',
}

/** Numeric seed from any string — stable across reloads */
function toSeed(s: string): number {
  return s.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

/**
 * Returns a consistent, category-relevant photo URL for a product.
 * @param categoryId  e.g. "tyre-repair"
 * @param productId   used as seed for variety within the category
 * @param width       image width in pixels (default 400)
 * @param height      image height in pixels (default 300)
 */
export function getProductImage(
  categoryId: string,
  productId: string,
  width = 400,
  height = 300,
): string {
  const keywords = CATEGORY_KEYWORDS[categoryId] ?? 'industrial,tools,workshop'
  const seed = toSeed(productId)
  return `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keywords)}?lock=${seed}`
}

/** Generic fallback when an image fails to load */
export function getFallbackImage(width = 400, height = 300): string {
  return `https://loremflickr.com/${width}/${height}/industrial,tools,workshop?lock=1`
}
