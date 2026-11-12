// Checks and cleans uploaded device photos before they are stored.
// Only JPEG and PNG are accepted. Metadata (EXIF incl. GPS, XMP, comments, text chunks) is removed,
// because a photo of a device can show the owner's location or serial numbers in its metadata.

export const FOTO_MAX_BYTES = 4 * 1024 * 1024;
export const FOTO_MAX_ANZAHL = 3;

export type BildTyp = 'jpeg' | 'png';

export function erkenneBildTyp(b: Uint8Array): BildTyp | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'png';
  return null;
}

/** Drops every APP1-APP15 segment (EXIF, XMP, ICC, Photoshop) and COM segments. Keeps image data unchanged. */
export function bereinigeJpeg(b: Uint8Array): Uint8Array {
  if (erkenneBildTyp(b) !== 'jpeg') throw new Error('Kein JPEG.');
  const teile: Uint8Array[] = [b.slice(0, 2)]; // SOI
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) throw new Error('Ungültiges JPEG.');
    while (b[i] === 0xff) i++; // fill bytes
    const marker = b[i];
    i++;
    if (marker === 0xd9) { // EOI
      teile.push(new Uint8Array([0xff, 0xd9]));
      break;
    }
    // Standalone markers without a length field.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      teile.push(new Uint8Array([0xff, marker]));
      continue;
    }
    if (i + 2 > b.length) throw new Error('Ungültiges JPEG.');
    const len = (b[i] << 8) | b[i + 1];
    if (len < 2 || i + len > b.length) throw new Error('Ungültiges JPEG.');
    // Segment = 0xFF + marker + (len bytes after the marker). i points just past the marker byte.
    const segment = b.slice(i - 2, i + len);
    const drop = (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe;
    if (!drop) teile.push(segment);
    i += len;
    if (marker === 0xda) { // SOS: entropy-coded data follows until EOI
      const rest = b.slice(i);
      const eoi = findeEoi(rest);
      teile.push(rest.slice(0, eoi));
      i = b.length; // handled
      teile.push(new Uint8Array([0xff, 0xd9]));
      break;
    }
  }
  return concat(teile);
}

function findeEoi(d: Uint8Array): number {
  // Entropy-coded data stuffs every 0xFF with 0x00, so the first 0xFF 0xD9 is the end of the image.
  for (let k = 0; k < d.length - 1; k++) {
    if (d[k] === 0xff && d[k + 1] === 0xd9) return k;
  }
  throw new Error('Ungültiges JPEG: kein Ende.');
}

const PNG_ERLAUBT = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'sBIT', 'bKGD', 'pHYs']);

/** Keeps only the chunks that affect how the image looks. eXIf, tEXt, zTXt, iTXt, tIME and unknown chunks are dropped. */
export function bereinigePng(b: Uint8Array): Uint8Array {
  if (erkenneBildTyp(b) !== 'png') throw new Error('Kein PNG.');
  const teile: Uint8Array[] = [b.slice(0, 8)];
  let i = 8;
  while (i < b.length) {
    if (i + 12 > b.length) throw new Error('Ungültiges PNG.');
    const len = ((b[i] << 24) >>> 0) + ((b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]);
    const typ = String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]);
    const ende = i + 12 + len;
    if (ende > b.length) throw new Error('Ungültiges PNG.');
    if (PNG_ERLAUBT.has(typ)) teile.push(b.slice(i, ende));
    i = ende;
    if (typ === 'IEND') break;
  }
  return concat(teile);
}

/** Validates and cleans one upload. Throws with a German message when the file must be refused. */
export function bereinigeFoto(b: Uint8Array): { typ: BildTyp; daten: Uint8Array } {
  if (b.length === 0) throw new Error('Die Datei ist leer.');
  if (b.length > FOTO_MAX_BYTES) throw new Error('Die Datei ist größer als 4 MB.');
  const typ = erkenneBildTyp(b);
  if (!typ) throw new Error('Nur JPEG- und PNG-Bilder sind erlaubt.');
  try {
    return { typ, daten: typ === 'jpeg' ? bereinigeJpeg(b) : bereinigePng(b) };
  } catch {
    throw new Error('Die Datei konnte nicht gelesen werden.');
  }
}

function concat(teile: Uint8Array[]): Uint8Array {
  const n = teile.reduce((s, t) => s + t.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const t of teile) {
    out.set(t, o);
    o += t.length;
  }
  return out;
}
