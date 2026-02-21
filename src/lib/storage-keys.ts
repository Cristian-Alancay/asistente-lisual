/**
 * Prefijo para claves de localStorage/sessionStorage.
 * Evita colisiones con otras apps en el mismo origen.
 */
export const STORAGE_PREFIX = "trabajo_";

export function prefixedKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}
