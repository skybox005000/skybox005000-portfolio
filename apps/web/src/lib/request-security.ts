import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type RateBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type SameOriginOptions = {
  maxBodyBytes?: number;
  allowFormData?: boolean;
};

const rateBuckets = new Map<string, RateBucket>();

function publicAppOrigin() {
  const configured = process.env.APP_URL;

  if (!configured) {
    return null;
  }

  try {
    return new URL(configured).origin;
  } catch {
    return null;
  }
}

function requestOrigin(request: Request) {
  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
}

function submittedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (origin) {
    return origin;
  }

  const referer = request.headers.get("referer");

  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function isAllowedOrigin(origin: string, request: Request) {
  const allowed = new Set(
    [requestOrigin(request), publicAppOrigin()].filter(Boolean) as string[],
  );

  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }

  return allowed.has(origin);
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function hashRequestKey(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export function noStoreJson(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export function enforceSameOriginRequest(
  request: Request,
  options: SameOriginOptions = {},
) {
  const origin = submittedOrigin(request);

  if (!origin || !isAllowedOrigin(origin, request)) {
    return noStoreJson("Request is not allowed.", 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);

  if (
    options.maxBodyBytes &&
    Number.isFinite(contentLength) &&
    contentLength > options.maxBodyBytes
  ) {
    return noStoreJson("Request is too large.", 413);
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() || "";

  if (options.allowFormData) {
    if (!contentType.includes("application/x-www-form-urlencoded") && !contentType.includes("multipart/form-data")) {
      return noStoreJson("Use a form request body.", 415);
    }
  } else if (!contentType.includes("application/json")) {
    return noStoreJson("Use a JSON request body.", 415);
  }

  return null;
}

export function enforceRateLimit(
  request: Request,
  options: RateLimitOptions,
) {
  const now = Date.now();

  for (const [key, bucket] of rateBuckets) {
    if (bucket.resetAt <= now) {
      rateBuckets.delete(key);
    }
  }

  const clientId = hashRequestKey(getClientIp(request));
  const bucketKey = `${options.key}:${clientId}`;
  const bucket = rateBuckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return null;
  }

  if (bucket.count >= options.limit) {
    const response = noStoreJson("Too many requests. Please try again later.", 429);
    response.headers.set("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
    return response;
  }

  bucket.count += 1;
  return null;
}
