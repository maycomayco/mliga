import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BEARER_PREFIX = "Bearer ";
const NO_STORE = { "Cache-Control": "no-store" } as const;

function unauthorized(): NextResponse {
  return new NextResponse(null, { status: 401, headers: NO_STORE });
}

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith(BEARER_PREFIX)) return false;

  const provided = header.slice(BEARER_PREFIX.length);

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  const startedAt = Date.now();
  try {
    await prisma.user.count();
    const latencyMs = Date.now() - startedAt;
    return NextResponse.json({ ok: true, latencyMs }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE });
  }
}
