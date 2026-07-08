const DEFAULT_TTL_MS = Number(process.env.API_CACHE_TTL_MS || 120000);

const responseCache = new Map();

const getCacheKey = (req) => `${req.method}:${req.originalUrl}`;
const getPathWithoutQuery = (url) => (url || "").split("?")[0];

const clearCache = () => {
  responseCache.clear();
};

const extractResourcePrefix = (originalUrl) => {
  const path = getPathWithoutQuery(originalUrl);
  const segments = path.split("/").filter(Boolean);

  // /api/v1/<resource>/...
  if (segments[0] === "api" && segments[1] === "v1" && segments[2]) {
    return `/api/v1/${segments[2]}`;
  }

  // /api/<resource>/...
  if (segments[0] === "api" && segments[1]) {
    return `/api/${segments[1]}`;
  }

  return null;
};

const RESOURCE_INVALIDATION_MAP = {
  "/api/v1/clients": [
    "/api/v1/clients",
    "/api/v1/client-service",
    "/api/v1/client-follow-ups",
    "/api/v1/clients-tasks",
    "/api/v1/clients-patologies",
    "/api/v1/family",
    "/api/v1/dashboard",
  ],
  "/api/v1/employees": [
    "/api/v1/employees",
    "/api/v1/client-service",
    "/api/v1/client-service-preselection",
    "/api/v1/client-follow-ups",
    "/api/v1/dashboard",
  ],
  "/api/v1/client-service": [
    "/api/v1/client-service",
    "/api/v1/clients",
    "/api/v1/employees",
    "/api/v1/dashboard",
  ],
  "/api/v1/client-service-preselection": [
    "/api/v1/client-service-preselection",
    "/api/v1/client-service",
    "/api/v1/clients",
    "/api/v1/employees",
  ],
  "/api/v1/client-follow-ups": [
    "/api/v1/client-follow-ups",
    "/api/v1/clients",
    "/api/v1/employees",
  ],
  "/api/v1/services": ["/api/v1/services", "/api/v1/client-service", "/api/v1/dashboard"],
  "/api/v1/configs": [
    "/api/v1/configs",
    "/api/v1/countries",
    "/api/v1/languages",
    "/api/v1/dashboard",
  ],
};

const buildInvalidationPrefixes = (originalUrl) => {
  const resourcePrefix = extractResourcePrefix(originalUrl);
  if (!resourcePrefix) {
    return ["/api/v1/dashboard"];
  }

  const mapped = RESOURCE_INVALIDATION_MAP[resourcePrefix] || [resourcePrefix];
  return Array.from(new Set([...mapped, "/api/v1/dashboard"]));
};

const invalidateCacheByPrefixes = (prefixes = []) => {
  if (!prefixes.length) return;

  for (const cacheKey of responseCache.keys()) {
    const [, urlPart = ""] = cacheKey.split(":");
    const path = getPathWithoutQuery(urlPart);

    if (prefixes.some((prefix) => path.startsWith(prefix))) {
      responseCache.delete(cacheKey);
    }
  }
};

const apiCacheMiddleware = (req, res, next) => {
  const method = req.method.toUpperCase();

  // Evitar caché en autenticación/OAuth.
  if (req.originalUrl.startsWith("/auth")) {
    return next();
  }

  // Invalidar caché ante cualquier mutación de datos.
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const invalidationPrefixes = buildInvalidationPrefixes(req.originalUrl);
    invalidateCacheByPrefixes(invalidationPrefixes);
    return next();
  }

  // Solo cachear GET.
  if (method !== "GET") {
    return next();
  }

  const cacheKey = getCacheKey(req);
  const cachedEntry = responseCache.get(cacheKey);
  const now = Date.now();

  if (cachedEntry && cachedEntry.expiresAt > now) {
    return res.status(cachedEntry.status).json(cachedEntry.payload);
  }

  if (cachedEntry) {
    responseCache.delete(cacheKey);
  }

  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    // Cachear solo respuestas exitosas.
    if (res.statusCode >= 200 && res.statusCode < 300) {
      responseCache.set(cacheKey, {
        status: res.statusCode,
        payload,
        expiresAt: Date.now() + DEFAULT_TTL_MS,
      });
    }

    return originalJson(payload);
  };

  next();
};

module.exports = {
  apiCacheMiddleware,
  clearCache,
  invalidateCacheByPrefixes,
};
