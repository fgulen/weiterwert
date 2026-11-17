import { describe, expect, it } from 'vitest';
import { byteaZuBytes, bytesZuBytea, sha256Hex } from './protokoll-pdf-kodierung';

describe('gespeicherte PDFs: Kodierung', () => {
  it('bytea geht hin und zurück ohne Veränderung', () => {
    const original = new Uint8Array([0, 1, 127, 128, 255, 37, 80, 68, 70]); // enthält "%PDF"-Bytes
    expect(byteaZuBytes(bytesZuBytea(original))).toEqual(original);
  });

  it('bytea beginnt mit \\x', () => {
    expect(bytesZuBytea(new Uint8Array([0xab]))).toBe('\\xab');
  });

  it('gleiche Bytes ergeben denselben Hash, andere nicht', () => {
    const a = new Uint8Array([1, 2, 3]);
    expect(sha256Hex(a)).toBe(sha256Hex(new Uint8Array([1, 2, 3])));
    expect(sha256Hex(a)).not.toBe(sha256Hex(new Uint8Array([1, 2, 4])));
    expect(sha256Hex(a)).toHaveLength(64);
  });
});
