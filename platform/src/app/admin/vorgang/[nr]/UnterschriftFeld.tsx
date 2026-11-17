'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Zeichenfeld für die Unterschrift. Schreibt die Zeichnung als PNG-Data-URL in ein verstecktes Feld
 * mit dem Namen "unterschrift". Funktioniert mit Maus, Touch und Stift.
 */
export default function UnterschriftFeld({ label, leer, loeschen }: { label: string; leer: string; loeschen: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [wert, setWert] = useState('');
  const zeichnet = useRef(false);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1d2433';
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    zeichnet.current = true;
    const ctx = canvas.current?.getContext('2d');
    const p = pos(e);
    ctx?.beginPath();
    ctx?.moveTo(p.x, p.y);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const zieh = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!zeichnet.current) return;
    const ctx = canvas.current?.getContext('2d');
    const p = pos(e);
    ctx?.lineTo(p.x, p.y);
    ctx?.stroke();
  };
  const ende = () => {
    if (!zeichnet.current) return;
    zeichnet.current = false;
    setWert(canvas.current?.toDataURL('image/png') ?? '');
  };
  const loesche = () => {
    const c = canvas.current;
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    setWert('');
  };

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <span>{label}</span>
      <canvas
        ref={canvas}
        width={400}
        height={140}
        aria-label={label}
        onPointerDown={start}
        onPointerMove={zieh}
        onPointerUp={ende}
        onPointerLeave={ende}
        style={{ width: '100%', maxWidth: 400, height: 140, border: '1px dashed var(--line)', borderRadius: 8, touchAction: 'none', background: '#fff' }}
      />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button type="button" onClick={loesche} style={{ minHeight: 44, padding: '8px 14px' }}>{loeschen}</button>
        <span style={{ fontSize: '0.85rem' }}>{wert ? '✓' : leer}</span>
      </div>
      <input type="hidden" name="unterschrift" value={wert} />
    </div>
  );
}
