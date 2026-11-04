import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PERFUMES_DIR = path.resolve('public/images/perfumes');

const DOWNLOADS = [
  {
    targetFiles: [
      'aroma-body-mist-50ml-vs-romantic-wish.webp',
      'vs-perfume-85ml-romantic-wish.webp'
    ],
    url: 'https://media.parfumo.com/perfumes/24/24331e-romantic-wish-victoria-s-secret_1200.jpg',
    fallbackUrl: 'https://fimgs.net/images/perfume/nd.33498.jpg'
  },
  {
    targetFiles: ['vs-perfume-85ml-lost-in-fantasy.webp'],
    url: 'https://fimgs.net/images/perfume/nd.9847.jpg'
  },
  {
    targetFiles: ['vs-perfume-85ml-mango-temptation.webp'],
    url: 'https://fimgs.net/images/perfume/nd.13036.jpg'
  },
  {
    targetFiles: ['vs-perfume-85ml-pear-glaze.webp'],
    url: 'https://fimgs.net/images/perfume/nd.7999.jpg'
  },
  {
    targetFiles: ['vs-perfume-85ml-pink-chiffon.webp'],
    url: 'https://fimgs.net/images/perfume/nd.14490.jpg'
  },
  {
    targetFiles: ['vs-perfume-85ml-summer-sexy.webp'],
    url: 'https://fimgs.net/images/perfume/nd.36829.jpg'
  }
];

async function fetchBuffer(url, fallback) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (res.ok) {
      const arr = await res.arrayBuffer();
      return Buffer.from(arr);
    }
  } catch (err) {
    console.warn(`Fetch error for ${url}:`, err.message);
  }

  if (fallback) {
    const res = await fetch(fallback, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (res.ok) {
      const arr = await res.arrayBuffer();
      return Buffer.from(arr);
    }
  }
  throw new Error(`Failed to download ${url}`);
}

async function processBottle(inputBuf, outPath) {
  const meta = await sharp(inputBuf).metadata();
  console.log(`Original size: ${meta.width}x${meta.height}, format: ${meta.format}`);

  // Create clean warm luxury studio background canvas 800x1000 (#f8f7f5)
  // Resize the commercial product photo to fit within 680x880 with contain
  const bottleResized = await sharp(inputBuf)
    .resize(680, 880, {
      fit: 'contain',
      background: { r: 248, g: 247, b: 245, alpha: 1 }
    })
    .toBuffer();

  await sharp({
    create: {
      width: 800,
      height: 1000,
      channels: 4,
      background: { r: 248, g: 247, b: 245, alpha: 1 }
    }
  })
    .composite([
      {
        input: bottleResized,
        gravity: 'center'
      }
    ])
    .webp({ quality: 92, effort: 5 })
    .toFile(outPath);

  const outStat = fs.statSync(outPath);
  console.log(`-> Saved: ${outPath} (${(outStat.size / 1024).toFixed(1)} KB)`);
}

async function main() {
  for (const item of DOWNLOADS) {
    console.log(`\nDownloading real perfume photo from ${item.url}...`);
    const buf = await fetchBuffer(item.url, item.fallbackUrl);
    for (const fileName of item.targetFiles) {
      const dest = path.join(PERFUMES_DIR, fileName);
      await processBottle(buf, dest);
    }
  }
  console.log('\nAll 7 remaining real perfume photos have been processed!');
}

main().catch(console.error);
