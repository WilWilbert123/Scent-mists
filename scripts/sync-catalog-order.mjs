import fs from 'node:fs';
import path from 'node:path';

const PRIORITY_SLUGS = [
  // Male picks
  'aroma-body-mist-50ml-clinique-happy',
  'aroma-body-mist-50ml-bvlgari-man-in-black',
  'aroma-body-mist-50ml-ck-eternity',
  'vs-perfume-85ml-secret-angel-gold',
  // Female picks
  'aroma-body-mist-50ml-vs-sweet-temptation',
  'aroma-body-mist-50ml-ariana-grande-sweet-like-candy',
  'aroma-body-mist-50ml-katy-perry-purr',
  'aroma-body-mist-50ml-vs-love-spell',
  'aroma-body-mist-50ml-paris-hilton-heiress',
  'vs-perfume-85ml-winter-bombshell',
  'aroma-body-mist-50ml-bbw-sweet-pea',
  'aroma-body-mist-50ml-vs-bombshell',
  'vs-perfume-85ml-pink-ravishing-love',
];

const catalogPath = path.resolve('data/catalog.json');
let existing = [];
if (fs.existsSync(catalogPath)) {
  try {
    existing = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  } catch (e) {
    existing = [];
  }
}

// Map existing products
const map = new Map();
for (const p of existing) {
  if (p && p.slug) map.set(p.slug, p);
}

// Create reordered list
const reordered = [];

// 1. Priority picks first
for (const slug of PRIORITY_SLUGS) {
  const item = map.get(slug);
  if (item) {
    item.image_url = `/images/perfumes/${slug}.svg`;
    item.gallery = [`/images/perfumes/${slug}.svg`];
    reordered.push(item);
    map.delete(slug);
  }
}

// 2. All remaining items
for (const [slug, item] of map.entries()) {
  item.image_url = `/images/perfumes/${slug}.svg`;
  item.gallery = [`/images/perfumes/${slug}.svg`];
  reordered.push(item);
}

fs.writeFileSync(catalogPath, JSON.stringify(reordered, null, 2), 'utf-8');
console.log(`Successfully synced ${reordered.length} products to data/catalog.json in priority order`);
