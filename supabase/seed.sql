-- supabase/seed.sql
-- SCENTS & MISTS — Initial Seed Data for Showcase Collections, Fragrances, and Site Content

INSERT INTO public.collections (id, name, slug, description, image_url, is_published)
VALUES
  (
    '11111111-1111-1111-1111-111111111101',
    'Altitude Botanicals',
    'altitude-botanicals',
    'Compositions shaped by crisp mountain air, wild cherry blossoms, and ancient cedar groves where clouds brush stone.',
    '/images/lifestyle/collection-altitude-botanicals.webp',
    TRUE
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    'Ephemeral Petals',
    'ephemeral-petals',
    'Delicate floral architectures capturing the fleeting days of spring bloom in serene high-altitude valleys.',
    '/images/lifestyle/collection-ephemeral-petals.webp',
    TRUE
  ),
  (
    '11111111-1111-1111-1111-111111111103',
    'Nocturnal Reserves',
    'nocturnal-reserves',
    'Deeper concentrations crafted for twilight hours, pairing botanical petals with warm woods, amber resins, and silk musk.',
    '/images/lifestyle/collection-nocturnal-reserves.webp',
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_published = EXCLUDED.is_published;

INSERT INTO public.products (
  name,
  slug,
  description,
  fragrance_family,
  top_notes,
  heart_notes,
  base_notes,
  image_url,
  gallery,
  collection_id,
  is_featured,
  is_published
)
VALUES
  (
    'Sakura & Mountain Mist',
    'sakura-and-mountain-mist',
    'An ethereal fragrance inspired by delicate cherry blossoms, crisp mountain air, and the serenity of a high-altitude morning. Formulated to evoke quiet stillness and translucent petal softness.',
    'Floral Musky',
    ARRAY['Crisp Mountain Air Accord', 'White Bergamot Mist', 'Dewy Pear Blossom'],
    ARRAY['Wild Cherry Blossom', 'Pink Peony Petal', 'Silver Needle White Tea'],
    ARRAY['Cashmere Cedarwood', 'Soft Silk Musk', 'Warm White Amber'],
    '/images/products/sakura-mountain-mist.webp',
    ARRAY['/images/products/sakura-mountain-mist.webp', '/images/products/morning-cedar-mist.webp', '/images/products/white-tea-snow-lotus.webp', '/images/products/velvet-amber-sakura-dusk.webp'],
    '11111111-1111-1111-1111-111111111101',
    TRUE,
    TRUE
  ),
  (
    'Morning Cedar & Mist',
    'morning-cedar-and-mist',
    'A quiet study of sun-warmed ancient cedar forests wrapped in cool early-morning vapor. Grounded, architectural, and meditative.',
    'Woody Aromatic',
    ARRAY['Crushed Pine Needle', 'Mineral Vapour Accord', 'Cardamom Husk'],
    ARRAY['Silver Cypress', 'Smoked Hinoki', 'Violet Leaf'],
    ARRAY['Deodar Cedar', 'Vetiver Root', 'Skin Musk'],
    '/images/products/morning-cedar-mist.webp',
    ARRAY['/images/products/morning-cedar-mist.webp', '/images/products/white-tea-snow-lotus.webp'],
    '11111111-1111-1111-1111-111111111101',
    FALSE,
    TRUE
  ),
  (
    'White Tea & Snow Lotus',
    'white-tea-and-snow-lotus',
    'Inspired by porcelain tea bowls steaming at dawn beside alpine blooms. Clean, contemplative, and weightless on the skin.',
    'Floral Green',
    ARRAY['Silver Needle White Tea', 'Mandarin Peel', 'Alpine Dew'],
    ARRAY['Snow Lotus Accord', 'White Iris Root', 'Jasmine Sambac'],
    ARRAY['Ambrette Seed', 'Blonde Woods', 'Clean Linen Musk'],
    '/images/products/white-tea-snow-lotus.webp',
    ARRAY['/images/products/white-tea-snow-lotus.webp', '/images/products/sakura-mountain-mist.webp'],
    '11111111-1111-1111-1111-111111111102',
    FALSE,
    TRUE
  ),
  (
    'Velvet Amber & Sakura Dusk',
    'velvet-amber-and-sakura-dusk',
    'As twilight settles over mountain valleys, delicate blossom petals meet warm resinous amber and toasted tonka bean.',
    'Amber Floral',
    ARRAY['Pink Peppercorn', 'Bitter Almond Blossom', 'Plum Nectar'],
    ARRAY['Night-Blooming Sakura', 'Damask Rose Absolute', 'Saffron Thread'],
    ARRAY['Labdanum Resin', 'Sandalwood Heart', 'Roasted Tonka'],
    '/images/products/velvet-amber-sakura-dusk.webp',
    ARRAY['/images/products/velvet-amber-sakura-dusk.webp', '/images/products/morning-cedar-mist.webp'],
    '11111111-1111-1111-1111-111111111103',
    FALSE,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes,
  image_url = EXCLUDED.image_url,
  gallery = EXCLUDED.gallery;

