// German labels for values stored in the database. Unknown values are shown as they are.
const STATUS: Record<string, string> = {
  neu: 'Neu',
  geprueft: 'Geprüft',
  zugeordnet: 'Zugeordnet',
  uebergeben: 'Übergeben',
  abgeschlossen: 'Abgeschlossen',
};

const GERAETE: Record<string, string> = {
  laptop: 'Laptop',
  tablet: 'Tablet',
  beides: 'Laptop und Tablet',
};

export function statusText(status: string): string {
  return STATUS[status] ?? status;
}

export function geraeteText(typ: string): string {
  return GERAETE[typ] ?? typ;
}
