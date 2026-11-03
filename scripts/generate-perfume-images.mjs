import fs from 'node:fs';
import path from 'node:path';

export const PERFUMES = [
  // ==========================================
  // TOP PRIORITY MALE PERFUMES (Shown first)
  // ==========================================
  {
    slug: 'aroma-body-mist-50ml-clinique-happy',
    name: 'Clinique Happy',
    displayName: 'Clinique Happy',
    brand: 'Clinique',
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CL-HAP-50',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#fed7aa',
    liquidMid: '#fb923c',
    liquidBottom: '#ea580c',
    glowColor: '#fdba74',
    edition: '01',
    isMainMale: true,
    isMainFemale: false,
  },
  {
    slug: 'aroma-body-mist-50ml-bvlgari-man-in-black',
    name: 'Bvlgari Man In Black',
    displayName: 'Bvlgari Man in Black',
    brand: 'Bvlgari',
    subtitle: 'Aroma Body Mist 50ml',
    code: 'BVL-MIB-50',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#fde68a',
    liquidMid: '#b45309',
    liquidBottom: '#451a03',
    glowColor: '#f59e0b',
    edition: '02',
    isMainMale: true,
    isMainFemale: false,
  },
  {
    slug: 'aroma-body-mist-50ml-ck-eternity',
    name: 'CK - Eternity',
    displayName: 'Eternity',
    brand: 'Calvin Klein',
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CCK02',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#ccfbf1',
    liquidMid: '#2dd4bf',
    liquidBottom: '#0f766e',
    glowColor: '#5eead4',
    edition: '03',
    isMainMale: true,
    isMainFemale: false,
  },
  {
    slug: 'vs-perfume-85ml-secret-angel-gold',
    name: 'Secret Angel Gold',
    displayName: 'Secret Angel Gold',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-SAG',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#fef08a',
    liquidMid: '#eab308',
    liquidBottom: '#854d0e',
    glowColor: '#fde047',
    edition: '04',
    isMainMale: true,
    isMainFemale: false,
  },

  // ==========================================
  // TOP PRIORITY FEMALE PERFUMES (Shown first)
  // ==========================================
  {
    slug: 'aroma-body-mist-50ml-vs-sweet-temptation',
    name: 'Sweet Temptation',
    displayName: 'Sweet Temptation',
    brand: "Victoria's Secret",
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CVS24',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#fbcfe8',
    liquidMid: '#f472b6',
    liquidBottom: '#be185d',
    glowColor: '#f9a8d4',
    edition: '05',
    isMainMale: false,
    isMainFemale: true,
  },
  {
    slug: 'aroma-body-mist-50ml-ariana-grande-sweet-like-candy',
    name: 'Ariana Grande - Sweet Like Candy',
    displayName: 'Sweet Like Candy',
    brand: 'Ariana Grande',
    subtitle: 'Aroma Body Mist 50ml',
    code: 'AG-SLC-50',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#fed7aa',
    liquidMid: '#f472b6',
    liquidBottom: '#9d174d',
    glowColor: '#f43f5e',
    edition: '06',
    isMainMale: false,
    isMainFemale: true,
  },
  {
    slug: 'aroma-body-mist-50ml-katy-perry-purr',
    name: 'Katy Perry - Purr',
    displayName: 'Purr',
    brand: 'Katy Perry',
    subtitle: 'Aroma Body Mist 50ml',
    code: 'KP-PURR-50',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#e9d5ff',
    liquidMid: '#c084fc',
    liquidBottom: '#6b21a8',
    glowColor: '#d8b4fe',
    edition: '07',
    isMainMale: false,
    isMainFemale: true,
  },
  {
    slug: 'aroma-body-mist-50ml-vs-love-spell',
    name: 'Love Spell',
    displayName: 'Love Spell',
    brand: "Victoria's Secret",
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CVS11',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#ddd6fe',
    liquidMid: '#a855f7',
    liquidBottom: '#581c87',
    glowColor: '#c084fc',
    edition: '08',
    isMainMale: false,
    isMainFemale: true,
  },
  {
    slug: 'aroma-body-mist-50ml-paris-hilton-heiress',
    name: 'Paris Hilton - Heiress',
    displayName: 'Heiress',
    brand: 'Paris Hilton',
    subtitle: 'Aroma Body Mist 50ml',
    code: 'PH-HEIR-50',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#fce7f3',
    liquidMid: '#f43f5e',
    liquidBottom: '#881337',
    glowColor: '#fb7185',
    edition: '09',
    isMainMale: false,
    isMainFemale: true,
  },
  {
    slug: 'vs-perfume-85ml-winter-bombshell',
    name: 'Winter Bombshell',
    displayName: 'Winter Bombshell',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-WB',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#cffafe',
    liquidMid: '#f472b6',
    liquidBottom: '#831843',
    glowColor: '#a5f3fc',
    edition: '10',
    isMainMale: false,
    isMainFemale: true,
  },
  {
    slug: 'aroma-body-mist-50ml-bbw-sweet-pea',
    name: 'Sweet Pea',
    displayName: 'Sweet Pea',
    brand: 'Bath & Body Works',
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CBB26',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#ffe4e6',
    liquidMid: '#fb7185',
    liquidBottom: '#9f1239',
    glowColor: '#fda4af',
    edition: '11',
    isMainMale: false,
    isMainFemale: true,
  },
  {
    slug: 'aroma-body-mist-50ml-vs-bombshell',
    name: 'Bombshell',
    displayName: 'Bombshell',
    brand: "Victoria's Secret",
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CVS03',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#fdf2f8',
    liquidMid: '#ec4899',
    liquidBottom: '#831843',
    glowColor: '#f472b6',
    edition: '12',
    isMainMale: false,
    isMainFemale: true,
  },
  {
    slug: 'vs-perfume-85ml-pink-ravishing-love',
    name: 'Pink Ravishing Love',
    displayName: 'Pink Ravishing Love',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-PRL',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#ffe4e6',
    liquidMid: '#f43f5e',
    liquidBottom: '#881337',
    glowColor: '#fb7185',
    edition: '13',
    isMainMale: false,
    isMainFemale: true,
  },

  // ==========================================
  // ADDITIONAL 50ML BODY MISTS
  // ==========================================
  {
    slug: 'aroma-body-mist-50ml-elizabeth-arden-green-tea',
    name: 'Elizabeth Arden - Green Tea',
    displayName: 'Green Tea',
    brand: 'Elizabeth Arden',
    subtitle: 'Aroma Body Mist 50ml',
    code: 'EA-GT-50',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#dcfce7',
    liquidMid: '#4ade80',
    liquidBottom: '#15803d',
    glowColor: '#86efac',
    edition: '14',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'aroma-body-mist-50ml-dg-cologne-light-blue',
    name: 'D&G Cologne - Light Blue',
    displayName: 'Light Blue',
    brand: 'Dolce & Gabbana',
    subtitle: 'Aroma Body Mist 50ml',
    code: 'DG-LB-50',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#e0f2fe',
    liquidMid: '#38bdf8',
    liquidBottom: '#0369a1',
    glowColor: '#7dd3fc',
    edition: '15',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'aroma-body-mist-50ml-vs-crush',
    name: 'VS - Crush',
    displayName: 'Crush',
    brand: "Victoria's Secret",
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CVS05',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#ffe4e6',
    liquidMid: '#fb7185',
    liquidBottom: '#9f1239',
    glowColor: '#fda4af',
    edition: '16',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'aroma-body-mist-50ml-vs-endless-love',
    name: 'VS - Endless Love',
    displayName: 'Endless Love',
    brand: "Victoria's Secret",
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CVS06',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#e0e7ff',
    liquidMid: '#818cf8',
    liquidBottom: '#3730a3',
    glowColor: '#a5b4fc',
    edition: '17',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'aroma-body-mist-50ml-vs-romantic-wish',
    name: 'VS - Romantic Wish',
    displayName: 'Romantic Wish',
    brand: "Victoria's Secret",
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CVS19',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#fae8ff',
    liquidMid: '#c084fc',
    liquidBottom: '#7e22ce',
    glowColor: '#e879f9',
    edition: '18',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'aroma-body-mist-50ml-vs-strawberries-and-champagne',
    name: 'Strawberries & Champagne',
    displayName: 'Strawberries & Champagne',
    brand: "Victoria's Secret",
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CVS22',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#ffe4e6',
    liquidMid: '#f43f5e',
    liquidBottom: '#9f1239',
    glowColor: '#fda4af',
    edition: '19',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'aroma-body-mist-50ml-vs-vanilla-lace',
    name: 'VS - Vanilla Lace',
    displayName: 'Vanilla Lace',
    brand: "Victoria's Secret",
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CVS25',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#fef3c7',
    liquidMid: '#f59e0b',
    liquidBottom: '#78350f',
    glowColor: '#fde68a',
    edition: '20',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'aroma-body-mist-50ml-vs-warm-embrace',
    name: 'VS - Warm Embrace',
    displayName: 'Warm Embrace',
    brand: "Victoria's Secret",
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CVS26',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#ffedd5',
    liquidMid: '#f97316',
    liquidBottom: '#7c2d12',
    glowColor: '#fdba74',
    edition: '21',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'aroma-body-mist-50ml-bbw-cucumber-melon',
    name: 'Cucumber Melon',
    displayName: 'Cucumber Melon',
    brand: 'Bath & Body Works',
    subtitle: 'Aroma Body Mist 50ml',
    code: 'CBB06',
    type: 'mist',
    volume: '50ml',
    volumeLabel: 'AROMA BODY MIST • 50 ML',
    liquidTop: '#ecfdf5',
    liquidMid: '#34d399',
    liquidBottom: '#065f46',
    glowColor: '#6ee7b7',
    edition: '22',
    isMainMale: false,
    isMainFemale: false,
  },

  // ==========================================
  // ADDITIONAL 85ML VS PERFUMES
  // ==========================================
  {
    slug: 'vs-perfume-85ml-forever-sexy',
    name: 'Forever Sexy',
    displayName: 'Forever Sexy',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-FS',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#fae8ff',
    liquidMid: '#c084fc',
    liquidBottom: '#6b21a8',
    glowColor: '#e879f9',
    edition: '23',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'vs-perfume-85ml-lost-in-fantasy',
    name: 'Lost in Fantasy',
    displayName: 'Lost in Fantasy',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-LIF',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#e0f2fe',
    liquidMid: '#38bdf8',
    liquidBottom: '#075985',
    glowColor: '#7dd3fc',
    edition: '24',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'vs-perfume-85ml-love-spell',
    name: 'Love Spell 85ml',
    displayName: 'Love Spell',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-LS',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#f3e8ff',
    liquidMid: '#a855f7',
    liquidBottom: '#581c87',
    glowColor: '#c084fc',
    edition: '25',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'vs-perfume-85ml-mango-temptation',
    name: 'Mango Temptation',
    displayName: 'Mango Temptation',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-MT',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#ffedd5',
    liquidMid: '#fb923c',
    liquidBottom: '#9a3412',
    glowColor: '#fdba74',
    edition: '26',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'vs-perfume-85ml-pear-glaze',
    name: 'Pear Glaze',
    displayName: 'Pear Glaze',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-PG',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#fef9c3',
    liquidMid: '#a3e635',
    liquidBottom: '#3f6212',
    glowColor: '#bef264',
    edition: '27',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'vs-perfume-85ml-pink-chiffon',
    name: 'Pink Chiffon',
    displayName: 'Pink Chiffon',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-PC',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#fce7f3',
    liquidMid: '#f472b6',
    liquidBottom: '#9d174d',
    glowColor: '#fbcfe8',
    edition: '28',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'vs-perfume-85ml-romantic-wish',
    name: 'Romantic Wish 85ml',
    displayName: 'Romantic Wish',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-RW',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#fae8ff',
    liquidMid: '#c084fc',
    liquidBottom: '#6b21a8',
    glowColor: '#d8b4fe',
    edition: '29',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'vs-perfume-85ml-summer-sexy',
    name: 'Summer Sexy',
    displayName: 'Summer Sexy',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-SS',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#fef08a',
    liquidMid: '#f97316',
    liquidBottom: '#991b1b',
    glowColor: '#fdba74',
    edition: '30',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'vs-perfume-85ml-strawberries-and-champagne',
    name: 'Strawberries & Champagne 85ml',
    displayName: 'Strawberries & Champagne',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-SC',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#ffe4e6',
    liquidMid: '#f43f5e',
    liquidBottom: '#881337',
    glowColor: '#fda4af',
    edition: '31',
    isMainMale: false,
    isMainFemale: false,
  },
  {
    slug: 'vs-perfume-85ml-sweet-temptation',
    name: 'Sweet Temptation 85ml',
    displayName: 'Sweet Temptation',
    brand: "Victoria's Secret",
    subtitle: 'Eau de Parfum 85ml',
    code: 'VS85-ST',
    type: 'perfume',
    volume: '85ml',
    volumeLabel: 'EAU DE PARFUM • 85 ML',
    liquidTop: '#fdf2f8',
    liquidMid: '#ec4899',
    liquidBottom: '#831843',
    glowColor: '#f472b6',
    edition: '32',
    isMainMale: false,
    isMainFemale: false,
  },
];

/**
 * Generates an SVG image that replicates the exact luxury crystal flacon
 * from the user's uploaded photograph:
 * - Octagonal multi-faceted jewel crystal cap
 * - Stepped polished rose-gold / gold atomizer collar
 * - Heavy beveled crystal flacon body with glowing liquid matching the fragrance
 * - Crisp cream/ivory label with double gold border
 * - Exact perfume name on the label (e.g. "Clinique Happy", "Bvlgari Man in Black", "Eternity", "Purr")
 * - Exact volume label: "AROMA BODY MIST • 50 ML" or "EAU DE PARFUM • 85 ML"
 */
function generateLuxuryFlaconSVG(p) {
  // Truncate or size text appropriately if long
  const nameLength = p.displayName.length;
  const nameFontSize = nameLength > 20 ? 16 : nameLength > 15 ? 18 : 21;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <!-- Background: Studio soft blush-ivory lighting with gentle vignette -->
    <radialGradient id="studioBg" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="#2a2426" />
      <stop offset="55%" stop-color="#181416" />
      <stop offset="100%" stop-color="#0d0a0b" />
    </radialGradient>

    <!-- Liquid Aura / Radiance -->
    <radialGradient id="auraLight" cx="50%" cy="58%" r="40%">
      <stop offset="0%" stop-color="${p.glowColor}" stop-opacity="0.35" />
      <stop offset="60%" stop-color="${p.liquidMid}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Flacon Liquid Color Gradient -->
    <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${p.liquidTop}" stop-opacity="0.75" />
      <stop offset="45%" stop-color="${p.liquidMid}" stop-opacity="0.82" />
      <stop offset="85%" stop-color="${p.liquidBottom}" stop-opacity="0.92" />
      <stop offset="100%" stop-color="#1a0f12" stop-opacity="0.96" />
    </linearGradient>

    <!-- Crystal Cap Facet Gradient -->
    <linearGradient id="crystalFacet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="30%" stop-color="#fdf4f5" stop-opacity="0.5" />
      <stop offset="70%" stop-color="#d4b8be" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.85" />
    </linearGradient>

    <!-- Warm Gold / Rose Gold Collar -->
    <linearGradient id="goldCollar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b47854" />
      <stop offset="18%" stop-color="#eec3a1" />
      <stop offset="35%" stop-color="#ffffff" />
      <stop offset="55%" stop-color="#f5d3b8" />
      <stop offset="80%" stop-color="#c98a63" />
      <stop offset="100%" stop-color="#8a4f2e" />
    </linearGradient>

    <!-- Gold Foil Text & Borders -->
    <linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d4af37" />
      <stop offset="40%" stop-color="#f7e1a0" />
      <stop offset="70%" stop-color="#c59b27" />
      <stop offset="100%" stop-color="#996515" />
    </linearGradient>

    <!-- Glass Edge Specular Highlights -->
    <linearGradient id="specularGlint" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>

    <!-- Studio Soft Dropshadow -->
    <filter id="flaconShadow" x="-20%" y="-15%" width="140%" height="135%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#000000" flood-opacity="0.85" />
    </filter>

    <filter id="subtleGlow">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="url(#studioBg)" />

  <!-- Aura Glow Behind Crystal -->
  <circle cx="400" cy="560" r="320" fill="url(#auraLight)" />

  <!-- Pedestal / Floor Shadow -->
  <ellipse cx="400" cy="855" rx="220" ry="24" fill="#000000" fill-opacity="0.8" />
  <ellipse cx="400" cy="850" rx="160" ry="14" fill="${p.liquidBottom}" fill-opacity="0.3" />

  <!-- FLACON GROUP WITH DROPSHADOW -->
  <g filter="url(#flaconShadow)">
    <!-- ============================================== -->
    <!-- 1. MULTI-FACETED CRYSTAL STOPPER (JEWEL TOP)  -->
    <!-- ============================================== -->
    <!-- Crystal Top Facet Base -->
    <polygon points="320,130 480,130 520,175 480,225 320,225 280,175" fill="url(#crystalFacet)" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8" />
    
    <!-- Interior Crystal Facets -->
    <polygon points="350,145 450,145 485,175 450,205 350,205 315,175" fill="#ffffff" fill-opacity="0.25" stroke="#ffffff" stroke-width="1" stroke-opacity="0.9" />
    <polygon points="375,155 425,155 445,175 425,195 375,195 355,175" fill="url(#crystalFacet)" fill-opacity="0.6" stroke="#ffffff" stroke-width="1" />
    
    <!-- Facet Refraction Rays -->
    <line x1="320" y1="130" x2="350" y2="145" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.9" />
    <line x1="480" y1="130" x2="450" y2="145" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.9" />
    <line x1="520" y1="175" x2="485" y2="175" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.9" />
    <line x1="480" y1="225" x2="450" y2="205" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.9" />
    <line x1="320" y1="225" x2="350" y2="205" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.9" />
    <line x1="280" y1="175" x2="315" y2="175" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.9" />

    <!-- Crystal Stem -->
    <rect x="375" y="225" width="50" height="20" fill="url(#crystalFacet)" stroke="#ffffff" stroke-width="0.8" />

    <!-- ============================================== -->
    <!-- 2. POLISHED ROSE GOLD ATOMIZER COLLAR          -->
    <!-- ============================================== -->
    <!-- Top Ring -->
    <rect x="360" y="245" width="80" height="12" rx="3" fill="url(#goldCollar)" stroke="url(#goldFoil)" stroke-width="0.8" />
    <!-- Atomizer Core Neck -->
    <rect x="350" y="257" width="100" height="42" rx="4" fill="url(#goldCollar)" stroke="url(#goldFoil)" stroke-width="1" />
    <!-- Collar Highlights & Ridges -->
    <line x1="350" y1="272" x2="450" y2="272" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.6" />
    <line x1="350" y1="288" x2="450" y2="288" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.5" />
    <!-- Bottom Collar Flange (Rests on shoulder) -->
    <rect x="330" y="299" width="140" height="14" rx="4" fill="url(#goldCollar)" stroke="url(#goldFoil)" stroke-width="0.8" />

    <!-- ============================================== -->
    <!-- 3. HEAVY CRYSTAL FLACON (SQUARE FACETED BODY)  -->
    <!-- ============================================== -->
    <!-- Outer Heavy Crystal Glass Silhouette with Beveled Shoulders & Base -->
    <path d="M235 345 L320 313 L480 313 L565 345 L565 790 L535 830 L265 830 L235 790 Z"
          fill="#1c1618"
          stroke="#ffffff"
          stroke-width="2.5"
          stroke-opacity="0.75" />

    <!-- Crystal Chamfer Sides (Bevel Edges) -->
    <path d="M235 345 L265 365 L265 795 L235 790 Z" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-width="1" stroke-opacity="0.3" />
    <path d="M565 345 L535 365 L535 795 L565 790 Z" fill="#000000" fill-opacity="0.3" stroke="#ffffff" stroke-width="1" stroke-opacity="0.2" />

    <!-- Interior Glass Chamber filled with Fragrance Liquid -->
    <path d="M260 365 L325 338 L475 338 L540 365 L540 785 L515 810 L285 810 L260 785 Z"
          fill="url(#liquidGrad)" />

    <!-- Thick Glass Base Reflection (Heavy Crystal Bottom) -->
    <rect x="260" y="805" width="280" height="22" fill="#ffffff" fill-opacity="0.25" />
    <line x1="265" y1="815" x2="535" y2="815" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.6" />

    <!-- Internal Fragrance Suction Tube -->
    <line x1="400" y1="313" x2="400" y2="800" stroke="#ffffff" stroke-opacity="0.45" stroke-width="3" />
    <line x1="398" y1="313" x2="398" y2="800" stroke="${p.liquidBottom}" stroke-opacity="0.4" stroke-width="1.5" />

    <!-- Crystal Wall Glass Glints & Specular Highlights -->
    <line x1="237" y1="346" x2="237" y2="788" stroke="url(#specularGlint)" stroke-width="6" stroke-opacity="0.85" />
    <line x1="265" y1="365" x2="265" y2="795" stroke="#ffffff" stroke-width="2" stroke-opacity="0.7" />
    <line x1="535" y1="365" x2="535" y2="795" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.4" />
    <line x1="320" y1="313" x2="235" y2="345" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.8" />
    <line x1="480" y1="313" x2="565" y2="345" stroke="#ffffff" stroke-width="2" stroke-opacity="0.6" />

    <!-- ============================================== -->
    <!-- 4. ELEGANT CREAM EMBOSSED LABEL (LIKE USER PHOTO) -->
    <!-- ============================================== -->
    <!-- Main Cream / Ivory Label Plaque -->
    <rect x="290" y="435" width="220" height="260" rx="4" fill="#faf6f0" stroke="url(#goldFoil)" stroke-width="2" />
    <!-- Inner Gold Hairline Inset -->
    <rect x="296" y="441" width="208" height="248" rx="2" fill="none" stroke="url(#goldFoil)" stroke-width="1" stroke-opacity="0.85" />

    <!-- Label Content: Identical to User Photo -->
    <!-- Edition Number -->
    <text x="400" y="468" font-family="'Cinzel', Georgia, serif" font-size="11" fill="#71553f" letter-spacing="3" text-anchor="middle">N° ${p.edition}</text>

    <!-- Brand Header -->
    <text x="400" y="500" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="16" font-weight="600" fill="#181416" letter-spacing="3.5" text-anchor="middle">SCENTS &amp; MISTS</text>
    
    <!-- Hairline Separator -->
    <line x1="345" y1="518" x2="455" y2="518" stroke="url(#goldFoil)" stroke-width="1" stroke-opacity="0.9" />

    <!-- BRAND / HOUSE SUB-LABEL -->
    <text x="400" y="540" font-family="'Cinzel', Georgia, serif" font-size="10" font-weight="600" fill="#8c6239" letter-spacing="2.5" text-anchor="middle">${p.brand.toUpperCase()}</text>

    <!-- EXACT PERFUME NAME IN ELEGANT SERIF ITALICS (THE CORE USER REQUIREMENT) -->
    <text x="400" y="582" font-family="'Playfair Display', 'Cormorant Garamond', Georgia, serif" font-size="${nameFontSize}" font-style="italic" font-weight="bold" fill="#110d0f" letter-spacing="0.8" text-anchor="middle">${p.displayName}</text>

    <!-- CODE -->
    <text x="400" y="616" font-family="'JetBrains Mono', Courier, monospace" font-size="10" font-weight="500" fill="#786154" letter-spacing="2" text-anchor="middle">${p.code}</text>

    <line x1="345" y1="632" x2="455" y2="632" stroke="#d4b896" stroke-width="0.8" />

    <!-- EXACT VOLUME SPECIFICATION -->
    <text x="400" y="656" font-family="'Cinzel', Georgia, serif" font-size="9.5" font-weight="600" fill="#382e2b" letter-spacing="2.5" text-anchor="middle">${p.volumeLabel}</text>
    <text x="400" y="674" font-family="sans-serif" font-size="7.5" fill="#a17a58" letter-spacing="2" text-anchor="middle">PARFUMERIE NATIONALE</text>
  </g>

  <!-- Bottom Brand Footnote Pill -->
  <g transform="translate(0, 905)">
    <rect x="220" y="0" width="360" height="52" rx="26" fill="#181416" fill-opacity="0.92" stroke="url(#goldFoil)" stroke-width="1.2" />
    <text x="400" y="23" font-family="'Cinzel', Georgia, serif" font-size="12" fill="url(#goldFoil)" font-weight="bold" letter-spacing="2.5" text-anchor="middle">${p.displayName.toUpperCase()}</text>
    <text x="400" y="41" font-family="'Cinzel', Georgia, serif" font-size="9" fill="#e4d5c3" letter-spacing="1.5" text-anchor="middle">${p.volume} • ${p.brand.toUpperCase()}</text>
  </g>
</svg>`;
}

const outDir = path.resolve('public/images/perfumes');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let count = 0;
for (const p of PERFUMES) {
  const filePath = path.join(outDir, `${p.slug}.svg`);
  fs.writeFileSync(filePath, generateLuxuryFlaconSVG(p), 'utf-8');
  count++;
}

console.log(`Successfully generated ${count} bespoke luxury flacon images matching the user's bottle in ${outDir}`);
