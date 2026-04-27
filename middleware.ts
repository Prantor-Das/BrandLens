import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function getRateLimitState(ip: string): RateLimitEntry {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    const nextEntry = {
      count: 0,
      resetAt: now + WINDOW_MS
    };

    rateLimitStore.set(ip, nextEntry);
    return nextEntry;
  }

  return current;
}

export function middleware(request: NextRequest) {
  const ip = getClientIp(request);
  const state = getRateLimitState(ip);
  const remaining = Math.max(0, MAX_REQUESTS - state.count - 1);

  if (state.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((state.resetAt - Date.now()) / 1000)
    );
    const response = NextResponse.json(
      {
        error: "Too many requests. Please wait a minute."
      },
      {
        status: 429
      }
    );

    response.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS));
    response.headers.set("X-RateLimit-Remaining", "0");
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(state.resetAt / 1000)));
    response.headers.set("Retry-After", String(retryAfterSeconds));

    return response;
  }

  state.count += 1;
  rateLimitStore.set(ip, state);

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(state.resetAt / 1000)));

  return response;
}

export const config = {
  matcher: ["/api/analyze"]
};
