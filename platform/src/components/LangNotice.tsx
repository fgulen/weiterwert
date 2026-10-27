'use client';

import { useEffect, useState } from "react";

/** Shown when the visitor came from the Turkish homepage (?lang=tr). The platform is German only for now. */
export function LangNotice() {
  const [zeigen, setZeigen] = useState(false);
  useEffect(() => {
    setZeigen(new URLSearchParams(window.location.search).get("lang") === "tr");
  }, []);
  if (!zeigen) return null;
  return (
    <p role="note" style={{ margin: 0, padding: "8px 16px", textAlign: "center", fontSize: "0.92rem", background: "var(--surface-alt)", color: "var(--ink)" }}>
      Bu sayfalar şimdilik yalnızca Almanca.
    </p>
  );
}
