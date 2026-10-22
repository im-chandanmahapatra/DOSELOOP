import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../client/public');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c >>> 0;
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makePngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function encodePng(width, height, rgbaBuffer) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makePngChunk('IHDR', ihdr);

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // Filter: None
    rgbaBuffer.copy(scanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const idatChunk = makePngChunk('IDAT', zlib.deflateSync(scanlines, { level: 9 }));
  const iendChunk = makePngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Distance from point (px, py) to line segment (ax, ay) -> (bx, by)
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Render DoseLoop mark with 4x supersampling
function renderDoseLoopMark(size) {
  const SS = 4; // Supersampling factor
  const W = size * SS;
  const H = size * SS;
  const buffer = Buffer.alloc(size * size * 4);

  const cx = W / 2;
  const cy = H / 2;
  const cornerRadius = 0.23 * W;
  const ringRadius = 0.29 * W;
  const strokeWidth = 0.088 * W;
  const halfStroke = strokeWidth / 2;
  const dotRadius = 0.095 * W;

  // Arc angles: from -90 deg (12 o'clock) clockwise to approx -145 deg (approx 10:20 o'clock)
  // That leaves a ~55 deg gap in the upper-left quadrant
  const startAngle = -Math.PI / 2;
  const endAngle = -Math.PI * 0.805;

  // Endpoint 1: (cx, cy - ringRadius)
  const cap1x = cx + ringRadius * Math.cos(startAngle);
  const cap1y = cy + ringRadius * Math.sin(startAngle);

  // Endpoint 2:
  const cap2x = cx + ringRadius * Math.cos(endAngle);
  const cap2y = cy + ringRadius * Math.sin(endAngle);

  // Colors:
  // Background: #7A2E38 (122, 46, 56)
  // Border: #B89450 (184, 148, 80)
  // Mark / Dot: #FFF8F0 (255, 248, 240)
  const bgR = 122, bgG = 46, bgB = 56;
  const markR = 255, markG = 248, markB = 240;
  const goldR = 184, goldG = 148, goldB = 80;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let totalR = 0, totalG = 0, totalB = 0, totalA = 0;

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x * SS + sx + 0.5;
          const py = y * SS + sy + 0.5;

          // Check rounded rectangle bounds
          // Distance from edge
          const dx = Math.max(0, Math.abs(px - cx) - (W / 2 - cornerRadius));
          const dy = Math.max(0, Math.abs(py - cy) - (H / 2 - cornerRadius));
          const cornerDist = Math.hypot(dx, dy);

          if (cornerDist > cornerRadius) {
            // Outside squircle
            continue;
          }

          // Inside squircle base color
          let r = bgR;
          let g = bgG;
          let b = bgB;
          let a = 1.0;

          // Subtle gold border on perimeter
          const borderDist = cornerRadius - cornerDist;
          if (borderDist < 1.5 * SS) {
            const t = Math.max(0, 1 - borderDist / (1.5 * SS)) * 0.35;
            r = Math.round(r * (1 - t) + goldR * t);
            g = Math.round(g * (1 - t) + goldG * t);
            b = Math.round(b * (1 - t) + goldB * t);
          }

          // Check central dot
          const distToCenter = Math.hypot(px - cx, py - cy);
          if (distToCenter <= dotRadius) {
            r = markR;
            g = markG;
            b = markB;
          } else {
            // Check arc distance
            const dRing = Math.abs(distToCenter - ringRadius);
            let angle = Math.atan2(py - cy, px - cx); // -PI to +PI
            
            // Check if angle is within the swept arc [-PI/2 -> PI] and [-PI -> -0.805*PI]
            let inArc = false;
            if (angle >= startAngle || angle <= endAngle) {
              inArc = true;
            }

            let distToMark = 999999;
            if (inArc && dRing <= halfStroke) {
              distToMark = dRing;
            } else {
              // check distance to rounded caps
              const dCap1 = Math.hypot(px - cap1x, py - cap1y);
              const dCap2 = Math.hypot(px - cap2x, py - cap2y);
              distToMark = Math.min(dCap1, dCap2);
            }

            if (distToMark <= halfStroke) {
              r = markR;
              g = markG;
              b = markB;
            }
          }

          totalR += r;
          totalG += g;
          totalB += b;
          totalA += a;
        }
      }

      const count = SS * SS;
      const finalA = totalA / count;
      const idx = (y * size + x) * 4;
      if (finalA > 0.001) {
        buffer[idx] = Math.round(totalR / count);
        buffer[idx + 1] = Math.round(totalG / count);
        buffer[idx + 2] = Math.round(totalB / count);
        buffer[idx + 3] = Math.round(finalA * 255);
      } else {
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0;
      }
    }
  }

  return encodePng(size, size, buffer);
}

// Generate multi-resolution ICO file
function createIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const dirEntries = [];
  const imageBuffers = [];

  for (const { width, height, buffer } of images) {
    const entry = Buffer.alloc(16);
    entry[0] = width >= 256 ? 0 : width;
    entry[1] = height >= 256 ? 0 : height;
    entry[2] = 0; // color count
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // offset of image data

    dirEntries.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

console.log('Generating DoseLoop brand favicon assets...');

const png16 = renderDoseLoopMark(16);
fs.writeFileSync(path.join(outDir, 'favicon-16x16.png'), png16);
console.log('✓ Created favicon-16x16.png (' + png16.length + ' bytes)');

const png32 = renderDoseLoopMark(32);
fs.writeFileSync(path.join(outDir, 'favicon-32x32.png'), png32);
console.log('✓ Created favicon-32x32.png (' + png32.length + ' bytes)');

const png48 = renderDoseLoopMark(48);

const png180 = renderDoseLoopMark(180);
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), png180);
console.log('✓ Created apple-touch-icon.png 180x180 (' + png180.length + ' bytes)');

const ico = createIco([
  { width: 16, height: 16, buffer: png16 },
  { width: 32, height: 32, buffer: png32 },
  { width: 48, height: 48, buffer: png48 }
]);
fs.writeFileSync(path.join(outDir, 'favicon.ico'), ico);
console.log('✓ Created favicon.ico (' + ico.length + ' bytes)');

// Also generate site.webmanifest
const manifest = {
  name: "DoseLoop — Family Health Companion",
  short_name: "DoseLoop",
  description: "AI-powered family health and medication companion for India",
  icons: [
    {
      src: "/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png"
    },
    {
      src: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png"
    },
    {
      src: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png"
    }
  ],
  theme_color: "#7A2E38",
  background_color: "#FAF7F2",
  display: "standalone",
  orientation: "portrait"
};
fs.writeFileSync(path.join(outDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
console.log('✓ Created site.webmanifest');
console.log('All favicon assets generated successfully!');
