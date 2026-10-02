// Browser compatibility for local HTTP testing and restricted browser storage.
// IDs identify local recovery goals; they are not authentication tokens.
let localIdCounter = 0;
export function createLocalId(): string {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
  if (typeof cryptoApi?.getRandomValues === "function") {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `local-${Date.now().toString(36)}-${++localIdCounter}-${Math.random().toString(36).slice(2)}`;
}

export function readPreference(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

export function writePreference(key: string, value: string): boolean {
  try { window.localStorage.setItem(key, value); return true; } catch { return false; }
}
