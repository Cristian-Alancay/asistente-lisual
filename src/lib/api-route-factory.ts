import { NextResponse } from "next/server";
import { cacheHeaders } from "@/lib/api-headers";

/**
 * Creates a standard GET route handler that wraps a server action.
 * Eliminates boilerplate for simple data-fetching endpoints.
 */
export function createGetRoute(fetcher: () => Promise<unknown>) {
  return async function GET() {
    try {
      const data = await fetcher();
      return NextResponse.json(data, { headers: cacheHeaders.private() });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch" },
        { status: 500, headers: cacheHeaders.private() }
      );
    }
  };
}
