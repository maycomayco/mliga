import { NextRequest, NextResponse } from "next/server";
import { logSecurityEvent } from "@/lib/security/audit";

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  return request.headers.get("x-real-ip");
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { event?: string; username?: string }
    | null;

  if (!body || body.event !== "login_failed") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await logSecurityEvent({
    event: "login_failed",
    ipAddress: getClientIp(request),
    userAgent: request.headers.get("user-agent"),
    metadata: {
      username: typeof body.username === "string" ? body.username.trim().toLowerCase() : null,
    },
  });

  return NextResponse.json({ ok: true });
}
