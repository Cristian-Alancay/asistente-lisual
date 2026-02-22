export const STORAGE_PREFIX = "trabajo_";

export function prefixedKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}
