type LogLevel = "info" | "warn" | "error";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "service_role",
  "apikey",
  "api_key",
]);

function redactSensitive(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    if (
      SENSITIVE_KEYS.has(lowerKey) ||
      lowerKey.includes("password") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token")
    ) {
      output[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = redactSensitive(value as Record<string, unknown>);
    } else {
      output[key] = value;
    }
  }
  return output;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const safeMeta = redactSensitive(meta);
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(safeMeta ? { meta: safeMeta } : {}),
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
  } else if (level === "warn") {
    console.warn(JSON.stringify(payload));
  } else {
    console.info(JSON.stringify(payload));
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};

