import { NextResponse } from "next/server";
import {
  enforceSameOriginRequest,
  getClientIp,
  hashRequestKey,
  noStoreJson,
} from "./request-security";

type GuardOptions = {
  routeId: string;
  maxBodyBytes: number;
  maxConcurrent: number;
  minuteLimit: number;
  hourLimit: number;
};

type WindowBucket = {
  count: number;
  resetAt: number;
};

type GuardPass = {
  clientId: string;
  headers: Record<string, string>;
  release: () => void;
};

type GuardResult =
  | { ok: true; value: GuardPass }
  | { ok: false; response: NextResponse };

const minuteBuckets = new Map<string, WindowBucket>();
const hourBuckets = new Map<string, WindowBucket>();
const activeRequests = new Map<string, number>();

function clientKey(routeId: string, request: Request) {
  return `${routeId}:${hashRequestKey(getClientIp(request))}`;
}

function limitedJson(message: string, status: number, retryAfterSeconds?: number) {
  const response = noStoreJson(message, status);

  if (retryAfterSeconds) {
    response.headers.set("Retry-After", String(retryAfterSeconds));
  }

  return response;
}

function applyWindowLimit(
  store: Map<string, WindowBucket>,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
) {
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    store.set(key, next);
    return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}

function pruneExpired(now: number) {
  for (const [key, bucket] of minuteBuckets) {
    if (bucket.resetAt <= now) {
      minuteBuckets.delete(key);
    }
  }

  for (const [key, bucket] of hourBuckets) {
    if (bucket.resetAt <= now) {
      hourBuckets.delete(key);
    }
  }
}

export function enforceGenAiRequestGuard(
  request: Request,
  options: GuardOptions,
): GuardResult {
  const sameOriginError = enforceSameOriginRequest(request, {
    maxBodyBytes: options.maxBodyBytes,
  });

  if (sameOriginError) {
    return {
      ok: false,
      response: sameOriginError,
    };
  }

  const now = Date.now();
  pruneExpired(now);

  const key = clientKey(options.routeId, request);
  const active = activeRequests.get(key) || 0;

  if (active >= options.maxConcurrent) {
    return {
      ok: false,
      response: limitedJson(
        "Please wait for the current AI response to finish before starting another one.",
        429,
        20,
      ),
    };
  }

  const minute = applyWindowLimit(
    minuteBuckets,
    key,
    options.minuteLimit,
    60_000,
    now,
  );

  if (!minute.allowed) {
    return {
      ok: false,
      response: limitedJson(
        "Too many AI requests. Please try again shortly.",
        429,
        Math.ceil((minute.resetAt - now) / 1000),
      ),
    };
  }

  const hour = applyWindowLimit(
    hourBuckets,
    key,
    options.hourLimit,
    60 * 60_000,
    now,
  );

  if (!hour.allowed) {
    return {
      ok: false,
      response: limitedJson(
        "AI request limit reached. Please try again later.",
        429,
        Math.ceil((hour.resetAt - now) / 1000),
      ),
    };
  }

  activeRequests.set(key, active + 1);

  let released = false;
  const release = () => {
    if (released) {
      return;
    }

    released = true;
    const nextActive = Math.max(0, (activeRequests.get(key) || 1) - 1);

    if (nextActive === 0) {
      activeRequests.delete(key);
    } else {
      activeRequests.set(key, nextActive);
    }
  };

  return {
    ok: true,
    value: {
      clientId: key,
      headers: {
        "X-RateLimit-Limit": String(options.minuteLimit),
        "X-RateLimit-Remaining": String(minute.remaining),
        "X-RateLimit-Reset": String(Math.ceil(minute.resetAt / 1000)),
      },
      release,
    },
  };
}

export function guardedTextStream(
  source: ReadableStream<Uint8Array>,
  release: () => void,
) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = source.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          controller.enqueue(value);
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        release();
      }
    },

    cancel() {
      release();
    },
  });
}
