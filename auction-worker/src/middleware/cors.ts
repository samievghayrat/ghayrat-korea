import { cors } from "hono/cors";
import type { Env } from "../types/env";

export function corsMiddleware() {
  return cors({
    origin: (origin, c) => {
      const allowed = c.env.CORS_ORIGIN || "*";
      if (allowed === "*") return "*";
      return allowed.split(",").includes(origin) ? origin : "";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  });
}
