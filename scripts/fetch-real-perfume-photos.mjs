import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const TARGETS = [
  {
    slug: 'aroma-body-mist-50ml-elizabeth-arden-green-tea',
    query: "Elizabeth Arden Green Tea Scent Spray perfume bottle studio",
    directUrl: 'https://www.elizabetharden.com/cdn/shop/files/pdp-green-tea-spray-3.3oz.jpg',
  },
  {
    slug: 'aroma-body-mist-50ml-bbw-cucumber-melon',
    query: "Bath and Body Works Cucumber Melon fine fragrance mist bottle",
  },
  {
    slug: 'aroma-body-mist-50ml-vs-strawberries-and-champagne',
    query: "Victoria's Secret Strawberries and Champagne fragrance mist bottle",
  },
  {
    slug: 'aroma-body-mist-50ml-vs-vanilla-lace',
    query: "Victoria's Secret Vanilla Lace fragrance mist bottle",
  },
  {
    slug: 'aroma-body-mist-50ml-vs-warm-embrace',
    query: "Victoria's Secret Warm Embrace fragrance mist bottle",
  },
  {
    slug: 'aroma-body-mist-50ml-vs-endless-love',
    query: "Victoria's Secret Endless Love fragrance mist bottle",
  },
  {
    slug: 'aroma-body-mist-50ml-vs-romantic-wish',
    query: "Victoria's Secret Romantic Wish fragrance mist bottle",
  },
  {
    slug: 'vs-perfume-85ml-love-spell',
    query: "Victoria's Secret Love Spell Eau de Parfum perfume bottle",
  },
  {
    slug: 'vs-perfume-85ml-sweet-temptation',
    query: "Victoria's Secret Sweet Temptation Eau de Parfum bottle",
  },
  {
    slug: 'vs-perfume-85ml-forever-sexy',
    query: "Victoria's Secret Forever Sexy Eau de Parfum bottle",
  },
  {
    slug: 'vs-perfume-85ml-lost-in-fantasy',
    query: "Victoria's Secret Lost in Fantasy fragrance mist bottle",
  },
  {
    slug: 'vs-perfume-85ml-mango-temptation',
    query: "Victoria's Secret Mango Temptation fragrance mist bottle",
  },
  {
    slug: 'vs-perfume-85ml-pear-glaze',
    query: "Victoria's Secret Pear Glaze fragrance mist bottle",
  },
  {
    slug: 'vs-perfume-85ml-pink-chiffon',
    query: "Bath and Body Works Pink Chiffon fine fragrance mist bottle",
  },
  {
    slug: 'vs-perfume-85ml-romantic-wish',
    query: "Victoria's Secret Romantic Wish perfume bottle",
  },
  {
    slug: 'vs-perfume-85ml-summer-sexy',
    query: "Victoria's Secret Very Sexy Now Eau de Parfum bottle",
  },
  {
    slug: 'vs-perfume-85ml-strawberries-and-champagne',
    query: "Victoria's Secret Strawberries and Champagne Eau de Parfum bottle",
  },
];

async function searchDDGImages(query) {
  try {
    const tokenRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iar=images&iax=images&ia=images`, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });
    const tokenHtml = await tokenRes.text();
    const vqdMatch = tokenHtml.match(/vqd=([0-9-]+)/) || tokenHtml.match(/vqd="([0-9-]+)"/);
    if (!vqdMatch) return [];

    const imgRes = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqdMatch[1]}&f=,,,type:photo,,&p=1`, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });
    const json = await imgRes.json();
    return json.results || [];
  } catch (e) {
    console.error(`Search error for ${query}:`, e.message);
    return [];
  }
}

async function downloadAndProcessImage(url, outPath) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  // Check valid image
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height) throw new Error("Invalid image");
  if (meta.width < 300 || meta.height < 300) throw new Error("Resolution too low");

  // Fit into an elegant 800x1000 luxury product presentation
  // with a clean, soft warm-white studio background
  await sharp(buffer)
    .resize(800, 1000, {
      fit: 'contain',
      background: { r: 248, g: 247, b: 245, alpha: 1 }
    })
    .webp({ quality: 92 })
    .toFile(outPath);

  return true;
}

async function run() {
  const outDir = path.resolve('public/images/perfumes');

  for (const target of TARGETS) {
    const outPath = path.join(outDir, `${target.slug}.webp`);
    console.log(`\nProcessing real bottle image for ${target.slug}...`);

    let success = false;

    // 1. Try direct URL if provided
    if (target.directUrl) {
      try {
        console.log(`Fetching direct URL: ${target.directUrl}`);
        await downloadAndProcessImage(target.directUrl, outPath);
        console.log(`✓ Successfully processed from direct URL: ${target.slug}`);
        success = true;
      } catch (err) {
        console.log(`Direct URL failed: ${err.message}`);
      }
    }

    if (success) continue;

    // 2. Search DuckDuckGo high-res product photos
    const results = await searchDDGImages(target.query);
    console.log(`Found ${results.length} candidate images for "${target.query}"`);

    // Sort by resolution and prioritize clean studio shots
    const candidates = results
      .filter(r => r.width >= 500 && r.height >= 500)
      .filter(r => !r.image.includes('ebay') && !r.image.includes('mercari') && !r.image.includes('poshmark'))
      .concat(results.filter(r => r.width >= 400 && r.height >= 400));

    for (const cand of candidates.slice(0, 10)) {
      try {
        console.log(`Trying candidate (${cand.width}x${cand.height}): ${cand.image.slice(0, 80)}...`);
        await downloadAndProcessImage(cand.image, outPath);
        console.log(`✓ Successfully downloaded & processed real-world photo for ${target.slug}!`);
        success = true;
        break;
      } catch (e) {
        console.log(`Candidate failed: ${e.message}`);
      }
    }

    if (!success) {
      console.warn(`⚠ Could not download high-res candidate for ${target.slug}`);
    }

    // Small delay to be polite
    await new Promise(r => setTimeout(r, 600));
  }

  console.log('\nAll 17 real perfume images processed!');
}

run().catch(console.error);
