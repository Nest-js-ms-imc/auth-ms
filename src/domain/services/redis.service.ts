export interface IRedisDomainService {
  del(key: string): Promise<void>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl: number): Promise<void>;
}
