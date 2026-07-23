export const CacheKeys = {
  authSession: (userId: string, sessionId: string): string =>
    `auth:session:${userId}:${sessionId}`,
  idempotency: (userId: string, key: string): string =>
    `idempotency:${userId}:${key}`,
  rateLimit: (scope: string, identifier: string): string =>
    `rate-limit:${scope}:${identifier}`,
  mandiAvgPrices: (mandiId: string): string =>
    `mandi:${mandiId}:avg_prices`,
  cropPrices: (productId: string, mandiId: string): string =>
    `product:${productId}:prices:${mandiId}`,
  farmerProfile: (farmerId: string): string =>
    `farmer:${farmerId}:profile`,
  marketInsight: (productId: string, mandiId: string): string =>
    `insight:${productId}:${mandiId}:active`,
  weatherCurrent: (lat: string, lon: string): string =>
    `weather:${lat}:${lon}:current`,
  weatherMandi: (mandiId: string): string =>
    `weather:${mandiId}:current`,
  feedReels: (farmerId: string): string =>
    `feed:${farmerId}:reels`,
  videoViews: (videoId: string): string =>
    `video:${videoId}:views`,
  farmerPointsToday: (farmerId: string): string =>
    `farmer:${farmerId}:points_today`,
  campaignBudgetRemaining: (campaignId: string): string =>
    `campaign:${campaignId}:budget_remaining`,
};
