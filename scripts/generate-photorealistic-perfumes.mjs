import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PERFUMES = [
  // ==========================================
  // TOP PRIORITY MALE PERFUMES (Shown first)
  // ==========================================
  {
    slug: 'aroma-body-mist-50ml-clinique-happy',
    name: 'Clinique Happy',
    displayName: 'Clinique Happy',
    brand: 'Clinique',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CL-HAP-50',
    edition: '01',
    tint: '#f97316', // Warm citrus gold
  },
  {
    slug: 'aroma-body-mist-50ml-bvlgari-man-in-black',
    name: 'Bvlgari Man In Black',
    displayName: 'Bvlgari Man in Black',
    brand: 'Bvlgari',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'BVL-MIB-50',
    edition: '02',
    tint: '#78350f', // Smoky cognac amber
  },
  {
    slug: 'aroma-body-mist-50ml-ck-eternity',
    name: 'CK - Eternity',
    displayName: 'Eternity',
    brand: 'Calvin Klein',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CCK02',
    edition: '03',
    tint: '#0f766e', // Crisp botanical sage
  },
  {
    slug: 'vs-perfume-85ml-secret-angel-gold',
    name: 'Secret Angel Gold',
    displayName: 'Secret Angel Gold',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-SAG',
    edition: '04',
    tint: '#ca8a04', // Radiant champagne gold
  },

  // ==========================================
  // TOP PRIORITY FEMALE PERFUMES (Shown first)
  // ==========================================
  {
    slug: 'aroma-body-mist-50ml-vs-sweet-temptation',
    name: 'Sweet Temptation',
    displayName: 'Sweet Temptation',
    brand: "Victoria's Secret",
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CVS24',
    edition: '05',
    tint: '#db2777', // Sweet apricot floral pink
  },
  {
    slug: 'aroma-body-mist-50ml-ariana-grande-sweet-like-candy',
    name: 'Ariana Grande - Sweet Like Candy',
    displayName: 'Sweet Like Candy',
    brand: 'Ariana Grande',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'AG-SLC-50',
    edition: '06',
    tint: '#ec4899', // Frosted sugar pink
  },
  {
    slug: 'aroma-body-mist-50ml-katy-perry-purr',
    name: 'Katy Perry - Purr',
    displayName: 'Purr',
    brand: 'Katy Perry',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'KP-PURR-50',
    edition: '07',
    tint: '#9333ea', // Velvety violet-plum
  },
  {
    slug: 'aroma-body-mist-50ml-vs-love-spell',
    name: 'Love Spell',
    displayName: 'Love Spell',
    brand: "Victoria's Secret",
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CVS11',
    edition: '08',
    tint: '#a855f7', // Cherry blossom & peach lavender
  },
  {
    slug: 'aroma-body-mist-50ml-paris-hilton-heiress',
    name: 'Paris Hilton - Heiress',
    displayName: 'Heiress',
    brand: 'Paris Hilton',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'PH-HEIR-50',
    edition: '09',
    tint: '#e11d48', // Sparkling champagne mimosa
  },
  {
    slug: 'vs-perfume-85ml-winter-bombshell',
    name: 'Winter Bombshell',
    displayName: 'Winter Bombshell',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-WB',
    edition: '10',
    tint: '#0284c7', // Frosted starfruit icy rose
  },
  {
    slug: 'aroma-body-mist-50ml-bbw-sweet-pea',
    name: 'Sweet Pea',
    displayName: 'Sweet Pea',
    brand: 'Bath & Body Works',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CBB26',
    edition: '11',
    tint: '#f43f5e', // Delicate sweet pea petals
  },
  {
    slug: 'aroma-body-mist-50ml-vs-bombshell',
    name: 'Bombshell',
    displayName: 'Bombshell',
    brand: "Victoria's Secret",
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CVS03',
    edition: '12',
    tint: '#ec4899', // Signature passion fruit pink
  },
  {
    slug: 'vs-perfume-85ml-pink-ravishing-love',
    name: 'Pink Ravishing Love',
    displayName: 'Pink Ravishing Love',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-PRL',
    edition: '13',
    tint: '#be123c', // Lush pomegranate rose
  },

  // ==========================================
  // ADDITIONAL 50ML BODY MISTS
  // ==========================================
  {
    slug: 'aroma-body-mist-50ml-elizabeth-arden-green-tea',
    name: 'Elizabeth Arden - Green Tea',
    displayName: 'Green Tea',
    brand: 'Elizabeth Arden',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'EA-GT-50',
    edition: '14',
    tint: '#16a34a',
  },
  {
    slug: 'aroma-body-mist-50ml-dg-cologne-light-blue',
    name: 'D&G Cologne - Light Blue',
    displayName: 'Light Blue',
    brand: 'Dolce & Gabbana',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'DG-LB-50',
    edition: '15',
    tint: '#0284c7',
  },
  {
    slug: 'aroma-body-mist-50ml-vs-crush',
    name: 'VS - Crush',
    displayName: 'Crush',
    brand: "Victoria's Secret",
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CVS05',
    edition: '16',
    tint: '#f43f5e',
  },
  {
    slug: 'aroma-body-mist-50ml-vs-endless-love',
    name: 'VS - Endless Love',
    displayName: 'Endless Love',
    brand: "Victoria's Secret",
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CVS06',
    edition: '17',
    tint: '#6366f1',
  },
  {
    slug: 'aroma-body-mist-50ml-vs-romantic-wish',
    name: 'VS - Romantic Wish',
    displayName: 'Romantic Wish',
    brand: "Victoria's Secret",
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CVS19',
    edition: '18',
    tint: '#c084fc',
  },
  {
    slug: 'aroma-body-mist-50ml-vs-strawberries-and-champagne',
    name: 'Strawberries & Champagne',
    displayName: 'Strawberries & Champagne',
    brand: "Victoria's Secret",
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CVS22',
    edition: '19',
    tint: '#f43f5e',
  },
  {
    slug: 'aroma-body-mist-50ml-vs-vanilla-lace',
    name: 'VS - Vanilla Lace',
    displayName: 'Vanilla Lace',
    brand: "Victoria's Secret",
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CVS25',
    edition: '20',
    tint: '#d97706',
  },
  {
    slug: 'aroma-body-mist-50ml-vs-warm-embrace',
    name: 'VS - Warm Embrace',
    displayName: 'Warm Embrace',
    brand: "Victoria's Secret",
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CVS26',
    edition: '21',
    tint: '#ea580c',
  },
  {
    slug: 'aroma-body-mist-50ml-bbw-cucumber-melon',
    name: 'Cucumber Melon',
    displayName: 'Cucumber Melon',
    brand: 'Bath & Body Works',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    code: 'CBB06',
    edition: '22',
    tint: '#10b981',
  },

  // ==========================================
  // ADDITIONAL 85ML VS PERFUMES
  // ==========================================
  {
    slug: 'vs-perfume-85ml-forever-sexy',
    name: 'Forever Sexy',
    displayName: 'Forever Sexy',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-FS',
    edition: '23',
    tint: '#a855f7',
  },
  {
    slug: 'vs-perfume-85ml-lost-in-fantasy',
    name: 'Lost in Fantasy',
    displayName: 'Lost in Fantasy',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-LIF',
    edition: '24',
    tint: '#0284c7',
  },
  {
    slug: 'vs-perfume-85ml-love-spell',
    name: 'Love Spell 85ml',
    displayName: 'Love Spell',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-LS',
    edition: '25',
    tint: '#9333ea',
  },
  {
    slug: 'vs-perfume-85ml-mango-temptation',
    name: 'Mango Temptation',
    displayName: 'Mango Temptation',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-MT',
    edition: '26',
    tint: '#f97316',
  },
  {
    slug: 'vs-perfume-85ml-pear-glaze',
    name: 'Pear Glaze',
    displayName: 'Pear Glaze',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-PG',
    edition: '27',
    tint: '#84cc16',
  },
  {
    slug: 'vs-perfume-85ml-pink-chiffon',
    name: 'Pink Chiffon',
    displayName: 'Pink Chiffon',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-PC',
    edition: '28',
    tint: '#f472b6',
  },
  {
    slug: 'vs-perfume-85ml-romantic-wish',
    name: 'Romantic Wish 85ml',
    displayName: 'Romantic Wish',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-RW',
    edition: '29',
    tint: '#c084fc',
  },
  {
    slug: 'vs-perfume-85ml-summer-sexy',
    name: 'Summer Sexy',
    displayName: 'Summer Sexy',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-SS',
    edition: '30',
    tint: '#ea580c',
  },
  {
    slug: 'vs-perfume-85ml-strawberries-and-champagne',
    name: 'Strawberries & Champagne 85ml',
    displayName: 'Strawberries & Champagne',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-SC',
    edition: '31',
    tint: '#f43f5e',
  },
  {
    slug: 'vs-perfume-85ml-sweet-temptation',
    name: 'Sweet Temptation 85ml',
    displayName: 'Sweet Temptation',
    brand: "Victoria's Secret",
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-ST',
    edition: '32',
    tint: '#db2777',
  },
];

const templatePath = path.resolve('public/images/products/sakura-mountain-mist.webp');
const outDir = path.resolve('public/images/perfumes');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Generating 32 photorealistic luxury perfume images based on real crystal flacon...');

  let successCount = 0;
  for (const p of PERFUMES) {
    const nameLength = p.displayName.length;
    const nameFontSize = nameLength > 20 ? 19 : nameLength > 15 ? 21 : 24;
    const safeBrand = p.brand.toUpperCase().replace(/&/g, '&amp;');
    const safeName = p.displayName.replace(/&/g, '&amp;');

    // Build the clean custom label SVG matching the real crystal flacon label
    const labelSvg = Buffer.from(`
      <svg width="270" height="310" xmlns="http://www.w3.org/2000/svg">
        <!-- Cream Label Background identical to original flacon texture -->
        <rect x="0" y="0" width="270" height="310" fill="#f1e2d7" />
        <rect x="6" y="6" width="258" height="298" fill="none" stroke="#ba9676" stroke-width="1.2" />
        <rect x="9" y="9" width="252" height="292" fill="none" stroke="#d5b597" stroke-width="0.7" />

        <!-- Edition Number -->
        <text x="135" y="44" font-family="'Cinzel', Georgia, serif" font-size="11" fill="#71553f" letter-spacing="3.5" text-anchor="middle">N° ${p.edition}</text>

        <!-- Brand Name: SCENTS & MISTS -->
        <text x="135" y="86" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="18" font-weight="600" fill="#181416" letter-spacing="3.5" text-anchor="middle">SCENTS &amp; MISTS</text>

        <!-- Hairline Divider -->
        <line x1="50" y1="108" x2="220" y2="108" stroke="#ba9676" stroke-width="0.9" />

        <!-- Brand / House -->
        <text x="135" y="132" font-family="'Cinzel', Georgia, serif" font-size="11" font-weight="600" fill="#8c6239" letter-spacing="2.5" text-anchor="middle">${safeBrand}</text>

        <!-- Exact Perfume Name in Elegant Serif Italics -->
        <text x="135" y="178" font-family="'Playfair Display', 'Cormorant Garamond', Georgia, serif" font-size="${nameFontSize}" font-style="italic" font-weight="bold" fill="#110d0f" letter-spacing="0.8" text-anchor="middle">${safeName}</text>

        <!-- Code -->
        <text x="135" y="206" font-family="'JetBrains Mono', Courier, monospace" font-size="9.5" fill="#786154" letter-spacing="2" text-anchor="middle">${p.code}</text>

        <!-- Hairline Divider -->
        <line x1="50" y1="222" x2="220" y2="222" stroke="#d5b597" stroke-width="0.8" />

        <!-- Volume Specification -->
        <text x="135" y="254" font-family="'Cinzel', Georgia, serif" font-size="10.5" font-weight="600" fill="#382e2b" letter-spacing="2.5" text-anchor="middle">${p.volumeLabel}</text>
        <text x="135" y="278" font-family="sans-serif" font-size="7.5" fill="#a17a58" letter-spacing="2" text-anchor="middle">DELUXE EDITION</text>
      </svg>
    `);

    // Subtle liquid tint overlay inside the glass chamber
    const tintSvg = Buffer.from(`
      <svg width="270" height="310" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="270" height="310" fill="${p.tint}" fill-opacity="0.04" />
      </svg>
    `);

    const outWebp = path.join(outDir, `${p.slug}.webp`);
    await sharp(templatePath)
      .composite([
        {
          input: labelSvg,
          left: 279,
          top: 432,
        },
      ])
      .webp({ quality: 94 })
      .toFile(outWebp);

    successCount++;
  }

  console.log(`Successfully generated ${successCount} photorealistic perfume images in ${outDir}!`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
