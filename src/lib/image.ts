/**
 * Generates a consistent, keyword-relevant product image URL.
 * Uses loremflickr.com — no API key required, pulls real Flickr photos.
 * The `lock` param seeds the random so the same product always shows the same image.
 */
export function getProductImage(
  imageQuery: string,
  seed: string,
  width = 400,
  height = 300,
): string {
  // Take up to 3 meaningful keywords, comma-join (loremflickr separator)
  const keywords = imageQuery
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(',')

  // Numeric seed from string so each product is stable across reloads
  const numericSeed = seed
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)

  return `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keywords)}?lock=${numericSeed}`
}

/** Fallback image when the primary fails */
export function getFallbackImage(width = 400, height = 300): string {
  return `https://loremflickr.com/${width}/${height}/industrial,tools,workshop?lock=42`
}
