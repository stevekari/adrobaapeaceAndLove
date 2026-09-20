import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimalist PNG generator using pure Node.js and zlib
function createPNG(width, height, drawFn) {
  // RGBA buffer + 1 filter byte per row
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const typeBuffer = Buffer.from(type, 'ascii');
  const buffer = Buffer.alloc(4 + 4 + length + 4);
  buffer.writeUInt32BE(length, 0);
  typeBuffer.copy(buffer, 4);
  data.copy(buffer, 8);

  const crc = crc32(Buffer.concat([typeBuffer, data]));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Drawing function for Peace & Love PWA icon
function drawAppIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Squircle corner radius (approx 22% of dimension)
  const r = 0.22;
  const dx = Math.max(0, Math.abs(nx - 0.5) - (0.5 - r));
  const dy = Math.max(0, Math.abs(ny - 0.5) - (0.5 - r));
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > r) {
    return [0, 0, 0, 0]; // Transparent outside squircle
  }

  // Linear Gradient: Top Left #0284c7 (2, 132, 199) -> Bottom Right #0f172a (15, 23, 42)
  const gradT = (nx + ny) / 2;
  let red = Math.round(2 * (1 - gradT) + 15 * gradT);
  let green = Math.round(132 * (1 - gradT) + 23 * gradT);
  let blue = Math.round(199 * (1 - gradT) + 42 * gradT);

  // Border ring inside squircle
  if (dist > r - 0.015 && dist <= r) {
    return [255, 255, 255, 180];
  }

  // Draw Building / Pillars Silhouette & Heart Emblem
  // Center: nx: 0.5, ny: 0.45
  const cx = nx - 0.5;
  const cy = ny - 0.45;

  // Pediment Roof (Triangle from y: 0.22 to y: 0.35, x: 0.25 to 0.75)
  if (ny >= 0.22 && ny <= 0.35) {
    const roofWidthAtY = ((ny - 0.22) / 0.13) * 0.26;
    if (Math.abs(cx) <= roofWidthAtY) {
      // Golden roof
      return [234, 179, 8, 255];
    }
  }

  // Entablature (Roof base beam: y 0.35 to 0.38, x 0.23 to 0.77)
  if (ny >= 0.35 && ny <= 0.38 && Math.abs(cx) <= 0.27) {
    return [253, 224, 71, 255];
  }

  // 4 Pillars (y 0.38 to 0.62)
  if (ny >= 0.38 && ny <= 0.62) {
    const pillarPositions = [-0.19, -0.065, 0.065, 0.19];
    const pillarWidth = 0.045;
    for (const px of pillarPositions) {
      if (Math.abs(cx - px) <= pillarWidth / 2) {
        return [255, 255, 255, 255]; // White marble pillar
      }
    }
  }

  // Building Base Steps (y 0.62 to 0.68)
  if (ny >= 0.62 && ny <= 0.65 && Math.abs(cx) <= 0.26) {
    return [255, 255, 255, 255];
  }
  if (ny >= 0.65 && ny <= 0.68 && Math.abs(cx) <= 0.29) {
    return [234, 179, 8, 255];
  }

  // Heart in roof apex (center nx: 0.5, ny: 0.28)
  const hx = (nx - 0.5) / 0.04;
  const hy = (ny - 0.28) / 0.04;
  if (hx * hx + Math.pow(hy - Math.sqrt(Math.abs(hx)), 2) <= 1.0) {
    return [255, 255, 255, 255];
  }

  // Subtle circular accent around the building
  const cDist = Math.sqrt(cx * cx + cy * cy);
  if (cDist >= 0.34 && cDist <= 0.355) {
    return [253, 224, 71, 140];
  }

  return [red, green, blue, 255];
}

const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate 512x512
const png512 = createPNG(512, 512, drawAppIcon);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), png512);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), png512);

// Generate 192x192
const png192 = createPNG(192, 192, drawAppIcon);
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), png192);

// Generate 180x180 (Apple Touch Icon)
const png180 = createPNG(180, 180, drawAppIcon);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), png180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon-180x180.png'), png180);

console.log('✅ All PWA Icons generated successfully in frontend/public/icons/');

