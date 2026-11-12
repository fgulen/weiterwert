import { describe, expect, it } from 'vitest';
import { bereinigeFoto, bereinigeJpeg, bereinigePng, erkenneBildTyp, FOTO_MAX_BYTES } from './bild';

const enc = (s: string) => new TextEncoder().encode(s);
const seg = (marker: number, data: number[]) => [0xff, marker, 0, data.length + 2, ...data];

// JPEG with an EXIF (GPS) segment, a quantisation table, a start-of-scan and entropy data.
const jpegMitExif = new Uint8Array([
  0xff, 0xd8,
  ...seg(0xe1, [...enc('Exif\0\0GPS-52.5200,13.4050')]),
  ...seg(0xdb, [0, 0]),
  ...seg(0xda, [1, 0]),
  0x12, 0x34, 0xff, 0x00, 0x56, // entropy-coded data (0xFF is stuffed with 0x00)
  0xff, 0xd9,
]);

// PNG with a tEXt chunk (location), an IDAT chunk and IEND. CRCs are not checked by the cleaner.
const chunk = (typ: string, data: number[]) => [0, 0, 0, data.length, ...enc(typ), ...data, 0, 0, 0, 0];
const pngMitText = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ...chunk('IHDR', new Array(13).fill(0)),
  ...chunk('tEXt', [...enc('GPS\0Berlin')]),
  ...chunk('IDAT', [1, 2, 3]),
  ...chunk('IEND', []),
]);

describe('erkenneBildTyp', () => {
  it('recognises JPEG and PNG by their signatures', () => {
    expect(erkenneBildTyp(jpegMitExif)).toBe('jpeg');
    expect(erkenneBildTyp(pngMitText)).toBe('png');
    expect(erkenneBildTyp(enc('GIF89a'))).toBeNull();
  });
});

describe('bereinigeJpeg', () => {
  it('removes the EXIF segment and keeps the image data', () => {
    const out = bereinigeJpeg(jpegMitExif);
    expect(new TextDecoder('latin1').decode(out)).not.toContain('GPS');
    expect(new TextDecoder('latin1').decode(out)).not.toContain('Exif');
    expect(Array.from(out)).toEqual([
      0xff, 0xd8,
      ...seg(0xdb, [0, 0]),
      ...seg(0xda, [1, 0]),
      0x12, 0x34, 0xff, 0x00, 0x56,
      0xff, 0xd9,
    ]);
  });
  it('refuses broken JPEG data', () => {
    expect(() => bereinigeJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x40]))).toThrow();
  });
});

describe('bereinigePng', () => {
  it('removes text chunks and keeps the image chunks', () => {
    const out = bereinigePng(pngMitText);
    expect(new TextDecoder('latin1').decode(out)).not.toContain('Berlin');
    expect(new TextDecoder('latin1').decode(out)).toContain('IDAT');
    expect(new TextDecoder('latin1').decode(out)).toContain('IEND');
  });
});

describe('bereinigeFoto', () => {
  it('returns the type and the cleaned bytes', () => {
    const r = bereinigeFoto(pngMitText);
    expect(r.typ).toBe('png');
    expect(r.daten.length).toBeLessThan(pngMitText.length);
  });
  it('refuses empty, oversized and unknown files', () => {
    expect(() => bereinigeFoto(new Uint8Array())).toThrow('leer');
    expect(() => bereinigeFoto(new Uint8Array(FOTO_MAX_BYTES + 1))).toThrow('4 MB');
    expect(() => bereinigeFoto(enc('GIF89a....'))).toThrow('JPEG- und PNG');
  });
  it('refuses a file that only has a valid signature', () => {
    expect(() => bereinigeFoto(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x40]))).toThrow('nicht gelesen');
  });
});
