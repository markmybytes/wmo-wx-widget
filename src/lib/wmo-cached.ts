/**
 * App-side WMO cache wiring: an in-memory `cacheable` store behind the pure
 * client's `WmoCacheAdapter` seam. The lib owns the keys and TTLs.
 */
import { Cacheable, KeyvCacheableMemory } from "cacheable";

import { createWmoClient } from "@/lib/wmo";

const cache = new Cacheable({ primary: new KeyvCacheableMemory({ useClone: false }) });

export const wmo = createWmoClient({
  cache: {
    async get(key) {
      // cacheable resolves undefined on miss/expiry; null is normalised too so it can never masquerade as a hit.
      return (await cache.get(key)) ?? undefined;
    },
    async set(key, value, ttlMs) {
      await cache.set(key, value, { ttl: ttlMs });
    },
  },
});
