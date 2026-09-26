import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([typeBuf, data]);
  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, body, crcBuf]);
}

function generatePng(size) {
  const width = size;
  const height = size;

  // Each scanline starts with filter type byte (0 = None), followed by RGBA pixels
  const rawData = Buffer.alloc(height * (1 + width * 4));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const cx = width / 2;
      const cy = height / 2;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default Emerald background (#0A3B2C)
      let r = 10;
      let g = 59;
      let b = 44;
      let a = 255;

      // Outer border circle (Gold #F59E0B)
      if (dist >= 0.82 && dist <= 0.88) {
        r = 245; g = 158; b = 11;
      }
      // Inner subtle border (#34D399)
      else if (dist >= 0.77 && dist <= 0.80) {
        r = 52; g = 211; b = 153;
      }
      // Inner decorative ring
      else if (dist >= 0.55 && dist <= 0.57) {
        r = 245; g = 158; b = 11;
      }
      // Central Minaret & Book Gold Center
      else if (dist < 0.35) {
        // Star or emblem center
        const angle = Math.atan2(dy, dx);
        const star = 0.22 + 0.08 * Math.cos(angle * 5);
        if (dist < star) {
          r = 252; g = 211; b = 77; // Bright Gold
        } else if (dist < 0.35 && dy > 0.08 && Math.abs(dx) < 0.25) {
          r = 245; g = 158; b = 11; // Open book base
        }
      }

      // Smooth corners for rounded app icon
      const cornerRadius = size * 0.22;
      const inBoxX = Math.abs(x - cx) - (cx - cornerRadius);
      const inBoxY = Math.abs(y - cy) - (cy - cornerRadius);
      if (inBoxX > 0 && inBoxY > 0) {
        const cornerDist = Math.sqrt(inBoxX * inBoxX + inBoxY * inBoxY);
        if (cornerDist > cornerRadius) {
          a = 0; // transparent
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: width(4), height(4), bitDepth(1), colorType(1), compression(1), filter(1), interlace(1)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth 8
  ihdrData[9] = 6;  // color type 6 (RGBA)
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // adaptive filtering
  ihdrData[12] = 0; // no interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files
fs.writeFileSync('public/pwa-192x192.png', generatePng(192));
fs.writeFileSync('public/pwa-512x512.png', generatePng(512));
fs.writeFileSync('public/pwa-maskable-512x512.png', generatePng(512));
fs.writeFileSync('public/apple-touch-icon.png', generatePng(180));
fs.writeFileSync('public/favicon.ico', generatePng(64));

console.log('Successfully generated all PWA PNG icons!');
