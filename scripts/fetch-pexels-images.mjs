#!/usr/bin/env node
/**
 * Fetches curated product photos from the Pexels API for each category,
 * downloads them to public/products/<category>/, and writes a mapping
 * to src/data/product-images.json.
 *
 * Usage:  PEXELS_API_KEY=xxxx node scripts/fetch-pexels-images.mjs
 *
 * Run once (or whenever you want to refresh imagery). Images are then served
 * locally — fast, no API calls at runtime, works offline.
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'

const API_KEY = process.env.PEXELS_API_KEY
if (!API_KEY) {
  console.error('\n❌ PEXELS_API_KEY not set.\n   Get a free key at https://www.pexels.com/api/\n   Then run:  PEXELS_API_KEY=your_key node scripts/fetch-pexels-images.mjs\n')
  process.exit(1)
}

const ROOT = path.resolve(import.meta.dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'public', 'products')
const MAP_FILE = path.join(ROOT, 'src', 'data', 'product-images.json')

const PHOTOS_PER_CATEGORY = 10

/**
 * Pexels search queries per category — tuned to return clean, relevant,
 * professional photos of the actual tool/equipment type.
 */
const CATEGORY_QUERIES = {
  'tyre-repair':         'car tire workshop',
  'spanners-wrenches':   'wrench spanner tools',
  'sockets-drives':      'socket wrench ratchet set',
  'pliers-screwdrivers': 'pliers screwdriver hand tools',
  'jacks-lifting':       'car jack garage lifting',
  'pneumatic-air':       'air compressor pneumatic tool',
  'grease-lubrication':  'grease gun lubrication',
  'welding':             'welding equipment torch',
  'painting-surface':    'spray paint gun automotive',
  'fastening-clamping':  'clamp tools workshop',
  'electrical-fans':     'industrial fan workshop',
  'safety-protective':   'safety gloves workshop gear',
  'sealing-adhesives':   'sealant adhesive tube',
  'miscellaneous':       'workshop tools industrial equipment',
}

async function searchPexels(query, perPage) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`
  const res = await fetch(url, { headers: { Authorization: API_KEY } })
  if (!res.ok) {
    throw new Error(`Pexels API ${res.status} for "${query}": ${await res.text()}`)
  }
  const data = await res.json()
  return data.photos ?? []
}

async function downloadImage(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`)
  await pipeline(res.body, createWriteStream(destPath))
}

async function main() {
  console.log('📸 Fetching product images from Pexels…\n')
  const mapping = {}

  for (const [categoryId, query] of Object.entries(CATEGORY_QUERIES)) {
    process.stdout.write(`  ${categoryId.padEnd(22)} "${query}" … `)
    const catDir = path.join(PUBLIC_DIR, categoryId)
    await mkdir(catDir, { recursive: true })

    let photos = []
    try {
      photos = await searchPexels(query, PHOTOS_PER_CATEGORY)
    } catch (err) {
      console.log(`❌ ${err.message}`)
      continue
    }

    const localPaths = []
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      // medium size is ~350-500px wide, plenty for cards & detail
      const src = photo.src.large || photo.src.medium || photo.src.original
      const ext = '.jpg'
      const fileName = `${i + 1}${ext}`
      const destPath = path.join(catDir, fileName)
      try {
        await downloadImage(src, destPath)
        localPaths.push(`/products/${categoryId}/${fileName}`)
      } catch {
        /* skip a failed image, keep going */
      }
    }

    mapping[categoryId] = localPaths
    console.log(`✅ ${localPaths.length} photos`)
  }

  await writeFile(MAP_FILE, JSON.stringify(mapping, null, 2) + '\n')
  console.log(`\n✅ Wrote mapping → ${path.relative(ROOT, MAP_FILE)}`)
  const total = Object.values(mapping).reduce((a, b) => a + b.length, 0)
  console.log(`✅ Downloaded ${total} images across ${Object.keys(mapping).length} categories\n`)
}

main().catch((err) => {
  console.error('\n❌ Fatal:', err)
  process.exit(1)
})
