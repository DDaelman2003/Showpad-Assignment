import { StorageStrategy } from "../storage/storageStrategy";
import { ClientConfig } from "../../config/clients";

export interface RateLimiterAlgorithm {
  isAllowed(clientId: string, config: ClientConfig, storage: StorageStrategy): Promise<boolean>;
}