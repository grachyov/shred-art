import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(root, "public");

await mkdir(outputDirectory, { recursive: true });

function smoothstep(value) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

for (const theme of ["light", "dark"]) {
  const source = resolve(root, `assets/renders/paper-pile-${theme}.png`);
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const horizontalMargin = info.width * 0.04;
  const verticalMargin = info.height * 0.08;

  for (let y = 0; y < info.height; y += 1) {
    const verticalFade = smoothstep(
      Math.min(y, info.height - 1 - y) / verticalMargin,
    );
    for (let x = 0; x < info.width; x += 1) {
      const horizontalFade = smoothstep(
        Math.min(x, info.width - 1 - x) / horizontalMargin,
      );
      const alphaIndex =
        (y * info.width + x) * info.channels + info.channels - 1;
      data[alphaIndex] = Math.round(
        data[alphaIndex] * horizontalFade * verticalFade,
      );
    }
  }

  const image = sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  });

  for (const width of [800, 1600, 2400]) {
    const filename = `paper-pile-${theme}-${width}.webp`;
    const { size } = await image
      .clone()
      .resize({ width })
      .webp({ quality: 92, alphaQuality: 100, effort: 6 })
      .toFile(resolve(outputDirectory, filename));
    console.log(`${filename}: ${(size / 1024).toFixed(1)} KiB`);
  }
}
