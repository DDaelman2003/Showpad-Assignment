export interface StorageStrategy {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlMs?: number): Promise<void>;
  incr(key: string, ttlMs?: number): Promise<number>;
  hgetall(key: string): Promise<Record<string, string>>;
  hmset(key: string, data: Record<string, string>, ttlMs?: number): Promise<void>;
}