import { StorageStrategy } from "./storageStrategy";

export class MemoryStorage implements StorageStrategy {
  private store = new Map<string, { value: any; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return typeof item.value === "string" ? item.value : JSON.stringify(item.value);
  }

  async set(key: string, value: string, ttlMs?: number): Promise<void> {
    const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async incr(key: string, ttlMs?: number): Promise<number> {
    console.log(`[IN-MEMORY STORAGE] Sleutel verhoogd: ${key}`);
    const current = await this.get(key);
    const count = current ? parseInt(current, 10) + 1 : 1;
    const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
    this.store.set(key, { value: count.toString(), expiresAt });
    return count;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    console.log(`[IN-MEMORY STORAGE] Hgetall aangeroepen voor: ${key}`);
    const item = this.store.get(key);
    if (!item) return {};
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return {};
    }
    return item.value || {};
  }

  async hmset(key: string, data: Record<string, string>, ttlMs?: number): Promise<void> {
    console.log(`[IN-MEMORY STORAGE] Hmset aangeroepen voor: ${key}`);
    const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
    this.store.set(key, { value: data, expiresAt });
  }
}