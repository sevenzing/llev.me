import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 60 requests per minute
const LIMIT = 60;
const TIME_WINDOW_MS = 60000;
const MAX_CLIENTS = 1000;
const clients = new Map<string, number[]>();
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const addClient = (key: string, value: number[]) => {
    if (clients.size >= MAX_CLIENTS) {
      // Remove the oldest entry to avoid memory leaks
      const oldestKey = clients.keys().next().value;
      clients.delete(oldestKey);
    }
    clients.set(key, value);
  };

  const clientKey = request.headers.get("x-forwarded-for");

  if (!clientKey) {
    return NextResponse.json(
      { error: "Unable to determine client identifier." },
      { status: 400 },
    );
  }

  const now = Date.now();
  const requestLog = clients.get(clientKey) || [];
  const updatedLog = requestLog.filter(
    (timestamp) => now - timestamp < TIME_WINDOW_MS,
  );
  console.log("updatedLog", updatedLog);
  if (updatedLog.length >= LIMIT) {
    console.log("TOO MANY REQUESTS");
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  updatedLog.push(now);
  addClient(clientKey, updatedLog);
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
};
