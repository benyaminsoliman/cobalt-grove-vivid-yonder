import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
};

const ICONS = {
  all: { rgb: [14, 107, 82], letter: "Q" },
  openai: { rgb: [26, 23, 20], letter: "O" },
  gemini: { rgb: [26, 115, 232], letter: "G" },
  qwen: { rgb: [91, 79, 207], letter: "W" },
  deepseek: { rgb: [47, 84, 196], letter: "D" },
  claude: { rgb: [176, 92, 62], letter: "C" },
  grok: { rgb: [17, 17, 17], letter: "X" },
  copilot: { rgb: [15, 108, 189], letter: "M" },
  mistral: { rgb: [196, 78, 18], letter: "M" },
  groq: { rgb: [186, 58, 42], letter: "R" },
  openrouter: { rgb: [72, 78, 168], letter: "R" },
  kimi: { rgb: [32, 32, 32], letter: "K" },
  glm: { rgb: [32, 86, 168], letter: "Z" },
  perplexity: { rgb: [24, 112, 122], letter: "P" },
};

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = pixel(x, y, size);
      const o = row + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

function inside(x, y, size, radius) {
  const left = 1;
  const top = 1;
  const right = size - 2;
  const bottom = size - 2;
  if (x < left || y < top || x > right || y > bottom) return false;
  const rad = Math.min(radius, (right - left) / 2);
  let cx = x;
  let cy = y;
  const inCornerX = x < left + rad || x > right - rad;
  const inCornerY = y < top + rad || y > bottom - rad;
  if (!(inCornerX && inCornerY)) return true;
  cx = x < left + rad ? left + rad : right - rad;
  cy = y < top + rad ? top + rad : bottom - rad;
  return (x - cx) ** 2 + (y - cy) ** 2 <= rad * rad;
}

function cover(x, y, size, letter, rgb) {
  if (!inside(x, y, size, size * 0.22)) return [0, 0, 0, 0];
  const glyph = FONT[letter];
  const scale = Math.max(1, Math.round(size / 11));
  const gw = 5 * scale;
  const gh = 7 * scale;
  const ox = Math.floor((size - gw) / 2);
  const oy = Math.floor((size - gh) / 2);
  const col = Math.floor((x - ox) / scale);
  const row = Math.floor((y - oy) / scale);
  if (row >= 0 && row < 7 && col >= 0 && col < 5 && glyph[row][col] === "1") return [243, 255, 248, 255];
  return [...rgb, 255];
}

const outDir = path.join(process.cwd(), "public/addin/icons");
fs.mkdirSync(outDir, { recursive: true });
for (const [id, spec] of Object.entries(ICONS)) {
  for (const size of [16, 32, 64, 80]) {
    const file = png(size, (x, y, s) => cover(x, y, s, spec.letter, spec.rgb));
    fs.writeFileSync(path.join(outDir, `${id}-${size}.png`), file);
  }
}
console.log("wrote", Object.keys(ICONS).length * 4, "icons");
