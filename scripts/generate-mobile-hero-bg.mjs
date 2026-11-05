import sharp from 'sharp';
import path from 'node:path';

const HERO_DIR = path.resolve('public/images/hero');

async function generateMobileHeroBackground({
  sourceFile,
  outputFile,
  isDark = false,
  canvasWidth = 840,
  canvasHeight = 1380,
  sceneHeight = 640,
  rightOffset = 0, // how close to the right edge (0 = pinned to right edge so all blossoms are visible)
}) {
  const srcPath = path.join(HERO_DIR, sourceFile);
  const outPath = path.join(HERO_DIR, outputFile);

  console.log(`Generating mobile background from ${sourceFile} -> ${outputFile}...`);

  // 1. Scale source to sceneHeight (640px)
  const scaledBuf = await sharp(srcPath)
    .resize(null, sceneHeight, { fit: 'fill' })
    .toBuffer();
  
  const scaledMeta = await sharp(scaledBuf).metadata();
  console.log(`Scaled scene: ${scaledMeta.width}x${scaledMeta.height}`);

  // 2. Crop horizontal window of canvasWidth (840px) capturing mountains + blossoms
  // The rightmost pixel is scaledMeta.width - rightOffset
  const leftX = Math.max(0, scaledMeta.width - canvasWidth - rightOffset);
  console.log(`Cropping from X = ${leftX} to ${leftX + canvasWidth}`);

  const croppedScene = await sharp(scaledBuf)
    .extract({
      left: leftX,
      top: 0,
      width: canvasWidth,
      height: sceneHeight,
    })
    .toBuffer();

  // 3. Create vertical feather mask for the bottom transition (seamless mist blend)
  // Mask is pure white from y=0 to y=sceneHeight-160, then fades to black at y=sceneHeight
  const fadeStart = sceneHeight - 160;
  const fadeLength = 160;
  const maskData = Buffer.alloc(canvasWidth * sceneHeight);

  for (let y = 0; y < sceneHeight; y++) {
    let alpha = 255;
    if (y >= fadeStart) {
      const progress = (y - fadeStart) / fadeLength; // 0 to 1
      alpha = Math.round(255 * (1 - progress));
    }
    for (let x = 0; x < canvasWidth; x++) {
      maskData[y * canvasWidth + x] = alpha;
    }
  }

  const maskImage = await sharp(maskData, {
    raw: { width: canvasWidth, height: sceneHeight, channels: 1 }
  })
    .png()
    .toBuffer();

  // Apply alpha mask to the cropped scene
  const rawScene = await sharp(croppedScene)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < rawScene.info.width * rawScene.info.height; i++) {
    const alphaVal = maskData[i];
    rawScene.data[i * 4 + 3] = Math.min(rawScene.data[i * 4 + 3], alphaVal);
  }

  const featheredScene = await sharp(rawScene.data, {
    raw: { width: canvasWidth, height: sceneHeight, channels: 4 }
  })
    .png()
    .toBuffer();

  // 4. Base background color canvas
  // Light: Soft blush-ivory mist palette (#F6EFEA)
  // Dark: Deep charcoal-espresso night atmosphere (#150F11)
  const bgBase = isDark
    ? { r: 21, g: 15, b: 17, alpha: 1 }
    : { r: 246, g: 239, b: 234, alpha: 1 };

  // 5. Composite onto the tall portrait canvas (840 x 1380)
  await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: bgBase,
    }
  })
    .composite([
      {
        input: featheredScene,
        top: 0,
        left: 0,
      }
    ])
    .webp({ quality: 94, effort: 5 })
    .toFile(outPath);

  console.log(`Successfully generated ${outPath}!`);
}

async function main() {
  // Light mode mobile background
  await generateMobileHeroBackground({
    sourceFile: 'himalayan-cherry-blossom-bg.webp',
    outputFile: 'himalayan-cherry-blossom-mobile-bg.webp',
    isDark: false,
    canvasWidth: 840,
    canvasHeight: 1380,
    sceneHeight: 640,
    rightOffset: 0,
  });

  // Dark mode mobile background
  await generateMobileHeroBackground({
    sourceFile: 'himalayan-cherry-blossom-dark-bg.webp',
    outputFile: 'himalayan-cherry-blossom-dark-mobile-bg.webp',
    isDark: true,
    canvasWidth: 840,
    canvasHeight: 1380,
    sceneHeight: 640,
    rightOffset: 0,
  });
}

main().catch(console.error);

