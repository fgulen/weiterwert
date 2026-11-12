// Status flow of a case. Only the next step is allowed; no going back, so every step is traceable.
export const STATUS_FOLGE: Record<string, string[]> = {
  neu: ['geprueft'],
  geprueft: ['zugeordnet'],
  zugeordnet: ['uebergeben'],
  uebergeben: ['abgeschlossen'],
  abgeschlossen: [],
};

export function naechsteStatus(status: string): string[] {
  return STATUS_FOLGE[status] ?? [];
}

export function istErlaubterWechsel(von: string, nach: string): boolean {
  return naechsteStatus(von).includes(nach);
}
