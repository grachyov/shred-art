import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(root, "public");
const source = resolve(root, "assets/source/logo.png");
const background = "#131313";
const foreground = "#ffffff";
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

await mkdir(outputDirectory, { recursive: true });

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
let left = info.width;
let top = info.height;
let right = -1;
let bottom = -1;

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    if (data[(y * info.width + x) * info.channels + info.channels - 1] === 0)
      continue;
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
  }
}

if (right < left || bottom < top)
  throw new Error("The source logo is completely transparent.");

const width = right - left + 1;
const height = bottom - top + 1;
const logo = await sharp(source)
  .extract({ left, top, width, height })
  .png()
  .toBuffer();

function squareLogo(size, padding = 0, opaque = false) {
  const innerSize = size - padding * 2;
  const canvasBackground = opaque ? background : transparent;
  const pipeline = sharp(logo)
    .resize(innerSize, innerSize, {
      fit: "contain",
      background: canvasBackground,
      kernel: "lanczos3",
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: canvasBackground,
    });
  return opaque ? pipeline.flatten({ background }) : pipeline;
}

const written = [];

async function save(filename, pipeline) {
  const path = resolve(outputDirectory, filename);
  await pipeline.toFile(path);
  written.push(filename);
}

for (const size of [48, 96, 144]) {
  await save(
    `logo-${size}.webp`,
    squareLogo(size).webp({ quality: 94, alphaQuality: 100, effort: 6 }),
  );
}

for (const size of [16, 32, 48, 96]) {
  await save(
    `favicon-${size}x${size}.png`,
    squareLogo(size, Math.max(1, Math.round(size * 0.03))).png({
      compressionLevel: 9,
    }),
  );
}

const ico = await pngToIco(
  [16, 32, 48].map((size) =>
    resolve(outputDirectory, `favicon-${size}x${size}.png`),
  ),
);
await writeFile(resolve(outputDirectory, "favicon.ico"), ico);
written.push("favicon.ico");

for (const [filename, size] of [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  await save(
    filename,
    squareLogo(size, Math.round(size * 0.09), true).png({
      compressionLevel: 9,
    }),
  );
}

const maskableSize = 512;
const maskableScale = (maskableSize * 0.78) / Math.hypot(width, height);
const maskableLogo = await sharp(logo)
  .resize(
    Math.floor(width * maskableScale),
    Math.floor(height * maskableScale),
    { fit: "inside" },
  )
  .png()
  .toBuffer();

await save(
  "icon-maskable-512.png",
  sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 3,
      background,
    },
  })
    .composite([{ input: maskableLogo, gravity: "centre" }])
    .png({ compressionLevel: 9 }),
);

const fontBuffer = await readFile(
  resolve(
    root,
    "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff",
  ),
);
const font = opentype.parse(
  fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength,
  ),
);
const wordmark = font.getPath("shred.art", 0, 0, 136);
wordmark.fill = foreground;
const bounds = wordmark.getBoundingBox();
const wordmarkWidth = bounds.x2 - bounds.x1;
const wordmarkHeight = bounds.y2 - bounds.y1;
const socialLogoHeight = 390;
const socialLogoWidth = Math.round((socialLogoHeight * width) / height);
const gap = 74;
const groupLeft = Math.round(
  (1200 - socialLogoWidth - gap - wordmarkWidth) / 2,
);
const wordmarkLeft = groupLeft + socialLogoWidth + gap - bounds.x1;
const wordmarkTop = (630 - wordmarkHeight) / 2 - bounds.y1;
const socialLogo = await sharp(logo)
  .resize({ height: socialLogoHeight })
  .png()
  .toBuffer();
const wordmarkSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><g transform="translate(${wordmarkLeft} ${wordmarkTop})">${wordmark.toSVG(3)}</g></svg>`,
);

await save(
  "og-image.png",
  sharp({
    create: { width: 1200, height: 630, channels: 3, background },
  })
    .composite([
      {
        input: socialLogo,
        left: groupLeft,
        top: Math.round((630 - socialLogoHeight) / 2),
      },
      { input: wordmarkSvg, left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9 }),
);

for (const filename of written) {
  const file = await stat(resolve(outputDirectory, filename));
  console.log(`${filename}: ${(file.size / 1024).toFixed(1)} KiB`);
}
