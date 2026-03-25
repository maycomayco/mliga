import { prisma } from "@/lib/prisma";
import { Prisma } from "../../prisma/generated/client";

export type SecurityEventName =
  | "login_success"
  | "login_failed"
  | "logout"
  | "admin_action"
  | "admin_forbidden";

type LogSecurityEventInput = {
  event: SecurityEventName;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function logSecurityEvent(input: LogSecurityEventInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        event: input.event,
        userId: input.userId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        metadata: input.metadata ?? Prisma.JsonNull,
      },
    });
  } catch (error) {
    console.error("Failed to persist security event", {
      event: input.event,
      error,
    });
  }
}
