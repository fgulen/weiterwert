import { getAppEnv } from '@/lib/env';

/**
 * Der Geräte-Ablauf ist nur in Test- und Entwicklungsumgebung sichtbar.
 * In der Live-Umgebung (APP_ENV production) bleibt er verborgen, bis das Team ihn freigibt.
 */
export function ablaufSichtbar(): boolean {
  return getAppEnv() === 'test' || process.env.NODE_ENV === 'development';
}
