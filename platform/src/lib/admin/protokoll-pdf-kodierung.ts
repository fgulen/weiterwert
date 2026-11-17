// Reine Hilfsfunktionen für gespeicherte PDFs (bytea in Postgres/PostgREST). Ohne Serverzugriff, testbar.
import { createHash } from 'node:crypto';

/** Bytes als PostgREST-bytea-Text: "\\x" plus Hex. */
export function bytesZuBytea(bytes: Uint8Array): string {
  return '\\x' + Buffer.from(bytes).toString('hex');
}

/** Zurück von PostgREST-bytea-Text ("\\x…") zu Bytes. */
export function byteaZuBytes(text: string): Uint8Array {
  const hex = text.startsWith('\\x') ? text.slice(2) : text;
  return new Uint8Array(Buffer.from(hex, 'hex'));
}

export function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}
