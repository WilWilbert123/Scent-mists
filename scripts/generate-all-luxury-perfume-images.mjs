import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const BRAIN_DIR = '/Users/wilbertgamis/.gemini/antigravity/brain/53a50c0f-93cb-4eef-a7cb-639b5e1359f8';
const OUT_DIR = path.resolve('public/images/perfumes');

// Master scene files in brain directory
const SCENES = {
  beach: path.join(BRAIN_DIR, 'calvin_klein_eternity_coastal_1793804085838.jpg'),
  lemons: path.join(BRAIN_DIR, 'dolce_gabbana_light_blue_cologne_1793804133708.jpg'),
  citrus: path.join(BRAIN_DIR, 'clinique_happy_perfume_1793803962675.jpg'),
  orchard: path.join(BRAIN_DIR, 'sweet_pea_mist_1793804117753.jpg'),
  honey: path.join(BRAIN_DIR, 'sweet_temptation_mist_1793804085465.jpg'),
  angelGold: path.join(BRAIN_DIR, 'secret_angel_gold_perfume_1793804080991.jpg'),
  bombshell: path.join(BRAIN_DIR, 'vs_bombshell_perfume_1793804097230.jpg'),
  loveSpell: path.join(BRAIN_DIR, 'vs_love_spell_mist_1793804103363.jpg'),
  crush: path.join(BRAIN_DIR, 'vs_crush_mist_1793804128774.jpg'),
  winterBombshell: path.join(BRAIN_DIR, 'vs_winter_bombshell_perfume_1793804097723.jpg'),
  darkSlate: path.join(BRAIN_DIR, 'bvlgari_man_in_black_1793804080619.jpg'),
  candy: path.join(BRAIN_DIR, 'sweet_like_candy_perfume_1793804086756.jpg'),
  purr: path.join(BRAIN_DIR, 'katy_perry_purr_perfume_1793804083092.jpg'),
  champagne: path.join(BRAIN_DIR, 'paris_hilton_heiress_perfume_1793804102303.jpg'),
  pinkSatin: path.join(BRAIN_DIR, 'vs_pink_ravishing_love_1793804104865.jpg'),
};

// All 32 catalog items mapped to their dedicated scene and styling
const CATALOG_ITEMS = [
  // 1. Clinique Happy (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-clinique-happy',
    scene: SCENES.citrus,
    isDirect: true,
  },
  // 2. Bvlgari Man In Black (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-bvlgari-man-in-black',
    scene: SCENES.darkSlate,
    isDirect: true,
  },
  // 3. CK Eternity (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-ck-eternity',
    scene: SCENES.beach,
    isDirect: true,
  },
  // 4. VS Secret Angel Gold (Direct Master Photo)
  {
    slug: 'vs-perfume-85ml-secret-angel-gold',
    scene: SCENES.angelGold,
    isDirect: true,
  },
  // 5. VS Sweet Temptation 50ml (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-vs-sweet-temptation',
    scene: SCENES.honey,
    isDirect: true,
  },
  // 6. Ariana Grande Sweet Like Candy (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-ariana-grande-sweet-like-candy',
    scene: SCENES.candy,
    isDirect: true,
  },
  // 7. Katy Perry Purr (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-katy-perry-purr',
    scene: SCENES.purr,
    isDirect: true,
  },
  // 8. VS Love Spell 50ml (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-vs-love-spell',
    scene: SCENES.loveSpell,
    isDirect: true,
  },
  // 9. Paris Hilton Heiress (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-paris-hilton-heiress',
    scene: SCENES.champagne,
    isDirect: true,
  },
  // 10. VS Winter Bombshell (Direct Master Photo)
  {
    slug: 'vs-perfume-85ml-winter-bombshell',
    scene: SCENES.winterBombshell,
    isDirect: true,
  },
  // 11. B&BW Sweet Pea (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-bbw-sweet-pea',
    scene: SCENES.orchard,
    isDirect: true,
  },
  // 12. VS Bombshell 50ml (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-vs-bombshell',
    scene: SCENES.bombshell,
    isDirect: true,
  },
  // 13. VS Pink Ravishing Love (Direct Master Photo)
  {
    slug: 'vs-perfume-85ml-pink-ravishing-love',
    scene: SCENES.pinkSatin,
    isDirect: true,
  },
  // 14. Elizabeth Arden Green Tea -> Orchard leaves, tea, fresh lemon on marble
  {
    slug: 'aroma-body-mist-50ml-elizabeth-arden-green-tea',
    scene: SCENES.orchard,
    name: 'Green Tea',
    brand: 'ELIZABETH ARDEN',
    sub: 'AROMA BODY MIST • 50 ML',
    code: 'EA-GT-50',
    color: '#2e7d32',
    labelX: 285,
    labelY: 420,
    labelW: 240,
    labelH: 280,
  },
  // 15. D&G Cologne Light Blue (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-dg-cologne-light-blue',
    scene: SCENES.lemons,
    isDirect: true,
  },
  // 16. VS Crush 50ml (Direct Master Photo)
  {
    slug: 'aroma-body-mist-50ml-vs-crush',
    scene: SCENES.crush,
    isDirect: true,
  },
  // 17. VS Endless Love 50ml -> Coastal beach sand, turquoise ocean waves
  {
    slug: 'aroma-body-mist-50ml-vs-endless-love',
    scene: SCENES.beach,
    name: 'Endless Love',
    brand: "VICTORIA'S SECRET",
    sub: 'AROMA BODY MIST • 50 ML',
    code: 'CVS06',
    color: '#0284c7',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 18. VS Romantic Wish 50ml -> Soft pink satin, fresh petals, morning mist
  {
    slug: 'aroma-body-mist-50ml-vs-romantic-wish',
    scene: SCENES.pinkSatin,
    name: 'Romantic Wish',
    brand: "VICTORIA'S SECRET",
    sub: 'AROMA BODY MIST • 50 ML',
    code: 'CVS19',
    color: '#9333ea',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 19. VS Strawberries & Champagne 50ml -> Champagne flutes, crystal bubbles, blush silk
  {
    slug: 'aroma-body-mist-50ml-vs-strawberries-and-champagne',
    scene: SCENES.champagne,
    name: 'Strawberries & Champagne',
    brand: "VICTORIA'S SECRET",
    sub: 'AROMA BODY MIST • 50 ML',
    code: 'CVS22',
    color: '#e11d48',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 20. VS Vanilla Lace 50ml -> Warm amber honeycomb, vintage lace, bourbon vanilla
  {
    slug: 'aroma-body-mist-50ml-vs-vanilla-lace',
    scene: SCENES.honey,
    name: 'Vanilla Lace',
    brand: "VICTORIA'S SECRET",
    sub: 'AROMA BODY MIST • 50 ML',
    code: 'CVS25',
    color: '#d97706',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 21. VS Warm Embrace 50ml -> Sunlit citrus, golden honey, glowing marble
  {
    slug: 'aroma-body-mist-50ml-vs-warm-embrace',
    scene: SCENES.citrus,
    name: 'Warm Embrace',
    brand: "VICTORIA'S SECRET",
    sub: 'AROMA BODY MIST • 50 ML',
    code: 'CVS26',
    color: '#ea580c',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 22. B&BW Cucumber Melon 50ml -> Mediterranean lemons, crisp green leaves on marble
  {
    slug: 'aroma-body-mist-50ml-bbw-cucumber-melon',
    scene: SCENES.lemons,
    name: 'Cucumber Melon',
    brand: 'BATH & BODY WORKS',
    sub: 'AROMA BODY MIST • 50 ML',
    code: 'CBB06',
    color: '#16a34a',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 23. VS Forever Sexy 85ml -> Dark volcanic slate, golden amber resin
  {
    slug: 'vs-perfume-85ml-forever-sexy',
    scene: SCENES.darkSlate,
    name: 'Forever Sexy',
    brand: "VICTORIA'S SECRET",
    sub: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-FS',
    color: '#a855f7',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 24. VS Lost in Fantasy 85ml -> Nocturne violet glow, exotic purple orchid
  {
    slug: 'vs-perfume-85ml-lost-in-fantasy',
    scene: SCENES.purr,
    name: 'Lost in Fantasy',
    brand: "VICTORIA'S SECRET",
    sub: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-LIF',
    color: '#7c3aed',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 25. VS Love Spell 85ml -> Purple velvet, cherry blossom petals (85ml EDP)
  {
    slug: 'vs-perfume-85ml-love-spell',
    scene: SCENES.loveSpell,
    name: 'Love Spell',
    brand: "VICTORIA'S SECRET",
    sub: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-LS',
    color: '#9333ea',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 26. VS Mango Temptation 85ml -> Sunlit sliced citrus and golden mango on marble
  {
    slug: 'vs-perfume-85ml-mango-temptation',
    scene: SCENES.citrus,
    name: 'Mango Temptation',
    brand: "VICTORIA'S SECRET",
    sub: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-MT',
    color: '#f97316',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 27. VS Pear Glaze 85ml -> Crisp orchard fruits, green leaves, morning dew
  {
    slug: 'vs-perfume-85ml-pear-glaze',
    scene: SCENES.orchard,
    name: 'Pear Glaze',
    brand: "VICTORIA'S SECRET",
    sub: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-PG',
    color: '#65a30d',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 28. VS Pink Chiffon 85ml -> Blush pink satin ribbon, rose petals
  {
    slug: 'vs-perfume-85ml-pink-chiffon',
    scene: SCENES.bombshell,
    name: 'Pink Chiffon',
    brand: "VICTORIA'S SECRET",
    sub: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-PC',
    color: '#ec4899',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 29. VS Romantic Wish 85ml -> Soft pink satin, pearls, morning petals (85ml EDP)
  {
    slug: 'vs-perfume-85ml-romantic-wish',
    scene: SCENES.pinkSatin,
    name: 'Romantic Wish',
    brand: "VICTORIA'S SECRET",
    sub: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-RW',
    color: '#a855f7',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 30. VS Summer Sexy 85ml -> Tropical sun-drenched beach, golden sand, ocean waves
  {
    slug: 'vs-perfume-85ml-summer-sexy',
    scene: SCENES.beach,
    name: 'Summer Sexy',
    brand: "VICTORIA'S SECRET",
    sub: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-SS',
    color: '#f97316',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 31. VS Strawberries & Champagne 85ml -> Champagne flutes, crystal bubbles (85ml EDP)
  {
    slug: 'vs-perfume-85ml-strawberries-and-champagne',
    scene: SCENES.champagne,
    name: 'Strawberries & Champagne',
    brand: "VICTORIA'S SECRET",
    sub: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-SC',
    color: '#e11d48',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
  // 32. VS Sweet Temptation 85ml -> Amber honeycomb, vintage lace (85ml EDP)
  {
    slug: 'vs-perfume-85ml-sweet-temptation',
    scene: SCENES.honey,
    name: 'Sweet Temptation',
    brand: "VICTORIA'S SECRET",
    sub: 'EAU DE PARFUM • 85 ML',
    code: 'VS85-ST',
    color: '#d97706',
    labelX: 280,
    labelY: 430,
    labelW: 240,
    labelH: 280,
  },
];

function generateLabelSvg(item) {
  const nameLen = item.name.length;
  const fontSize = nameLen > 22 ? 16 : nameLen > 15 ? 18 : 21;
  const safeBrand = item.brand.replace(/&/g, '&amp;');
  const safeName = item.name.replace(/&/g, '&amp;');

  return Buffer.from(`
    <svg width="${item.labelW}" height="${item.labelH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.18" />
        </filter>
      </defs>
      <!-- Luxury Ivory Parchment Label with Gold Border -->
      <g filter="url(#softGlow)">
        <rect x="4" y="4" width="${item.labelW - 8}" height="${item.labelH - 8}" rx="2" fill="#FAF5EE" />
        <rect x="8" y="8" width="${item.labelW - 16}" height="${item.labelH - 16}" rx="1" fill="none" stroke="#C49A76" stroke-width="1.4" />
        <rect x="11" y="11" width="${item.labelW - 22}" height="${item.labelH - 22}" fill="none" stroke="#D9B89B" stroke-width="0.7" />
      </g>

      <!-- House / Atelier Header -->
      <text x="${item.labelW / 2}" y="38" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="9" font-weight="600" fill="#71553F" letter-spacing="2.5" text-anchor="middle">SCENTS &amp; MISTS</text>
      <text x="${item.labelW / 2}" y="56" font-family="'Cinzel', Georgia, serif" font-size="8" fill="#8C6239" letter-spacing="1.8" text-anchor="middle">${safeBrand}</text>

      <!-- Gold Hairline Divider -->
      <line x1="30" y1="72" x2="${item.labelW - 30}" y2="72" stroke="#C49A76" stroke-width="0.8" />

      <!-- Perfume Name in Elegant Serif Italics -->
      <text x="${item.labelW / 2}" y="125" font-family="'Playfair Display', Georgia, serif" font-size="${fontSize}" font-style="italic" font-weight="bold" fill="#1C1817" letter-spacing="0.5" text-anchor="middle">${safeName}</text>

      <!-- Product Code -->
      <text x="${item.labelW / 2}" y="152" font-family="'JetBrains Mono', Courier, monospace" font-size="8.5" fill="#786154" letter-spacing="2" text-anchor="middle">${item.code}</text>

      <!-- Gold Hairline Divider -->
      <line x1="30" y1="168" x2="${item.labelW - 30}" y2="168" stroke="#D9B89B" stroke-width="0.7" />

      <!-- Volume & Concentration -->
      <text x="${item.labelW / 2}" y="200" font-family="'Cinzel', Georgia, serif" font-size="8.5" font-weight="600" fill="#382E2B" letter-spacing="2" text-anchor="middle">${item.sub}</text>
      <text x="${item.labelW / 2}" y="222" font-family="sans-serif" font-size="7" fill="#A17A58" letter-spacing="2" text-anchor="middle">PARFUMERIE NATIONALE</text>
    </svg>
  `);
}

async function main() {
  console.log(`Generating all 32 commercial advertising perfume images with rich ingredient backgrounds...`);

  let count = 0;
  for (const item of CATALOG_ITEMS) {
    const outPath = path.join(OUT_DIR, `${item.slug}.webp`);

    if (item.isDirect) {
      // 1. Direct master advertising photograph: resize cleanly to 800x1000
      await sharp(item.scene)
        .resize(800, 1000, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 92, effort: 5 })
        .toFile(outPath);
    } else {
      // 2. Composite themed commercial advertising photograph with custom label
      const baseScene = await sharp(item.scene)
        .resize(800, 1000, {
          fit: 'cover',
          position: 'center',
        })
        .toBuffer();

      const labelBuffer = generateLabelSvg(item);

      // Composite the label smoothly onto the center flacon of the advertising scene
      await sharp(baseScene)
        .composite([
          {
            input: labelBuffer,
            left: item.labelX,
            top: item.labelY,
          },
        ])
        .webp({ quality: 92, effort: 5 })
        .toFile(outPath);
    }

    const stat = fs.statSync(outPath);
    console.log(`[${++count}/32] Saved: ${item.slug}.webp (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  console.log(`\nAll 32 perfumes successfully generated with rich commercial ingredient backgrounds!`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
