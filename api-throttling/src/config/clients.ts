export interface ClientConfig {
  clientId: string;
  // Fixed Window instellingen
  fixedWindowLimit: number; // bijv. max 5 requests
  fixedWindowMs: number;    // per 10 seconden

  // Token Bucket instellingen
  bucketCapacity: number;   // max capaciteit van de bucket
  refillRatePerSec: number; // aantal tokens toegevoegd per seconde
}

export const CLIENT_CONFIGS: Record<string, ClientConfig> = {
  "client-tier-basic": {
    clientId: "client-tier-basic",
    fixedWindowLimit: 3,
    fixedWindowMs: 10000, // 3 requests per 10 seconden
    bucketCapacity: 3,
    refillRatePerSec: 0.5 // 1 token per 2 sec
  },
  "client-tier-premium": {
    clientId: "client-tier-premium",
    fixedWindowLimit: 10,
    fixedWindowMs: 10000, // 10 requests per 10 seconden
    bucketCapacity: 10,
    refillRatePerSec: 2 // 2 tokens per sec
  }
};