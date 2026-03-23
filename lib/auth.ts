import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins/username";
import { scryptSync, timingSafeEqual, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";

function requiredEnv(name: "BETTER_AUTH_SECRET" | "BETTER_AUTH_URL"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function assertStrongAuthSecret(secret: string): string {
  const weakValues = new Set(["changeme", "secret", "better-auth-secret", "default-secret"]);
  if (secret.length < 32 || weakValues.has(secret.toLowerCase())) {
    throw new Error(
      "BETTER_AUTH_SECRET is too weak. Use a random secret with at least 32 characters."
    );
  }
  return secret;
}

function parseTrustedOrigins(baseURL: string): string[] {
  const fromEnv = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origins = new Set<string>([new URL(baseURL).origin, ...fromEnv]);
  return Array.from(origins);
}

const baseURL = requiredEnv("BETTER_AUTH_URL");
const secret = assertStrongAuthSecret(requiredEnv("BETTER_AUTH_SECRET"));
const trustedOrigins = parseTrustedOrigins(baseURL);
const isProduction = process.env.NODE_ENV === "production";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyLegacyScryptHash(storedHash: string, password: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;

  const [salt, hashHex] = parts;
  const expected = Buffer.from(hashHex, "hex");
  const actual = Buffer.from(scryptSync(password, salt, 64).toString("hex"), "hex");

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export const auth = betterAuth({
  secret,
  baseURL,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false,
    password: {
      hash: async (password) => hashPassword(password),
      verify: async ({ hash, password }) => verifyLegacyScryptHash(hash, password),
    },
  },
  plugins: [
    nextCookies(),
    username({
      usernameNormalization: (value) => value.trim().toLowerCase(),
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
    },
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"],
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/username": {
        window: 300,
        max: 3,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session, context) => {
          await logSecurityEvent({
            event: "login_success",
            userId: session.userId,
            ipAddress: context?.request?.headers?.get("x-forwarded-for") ?? null,
            userAgent: context?.request?.headers?.get("user-agent") ?? null,
          });
        },
      },
      delete: {
        after: async (session, context) => {
          await logSecurityEvent({
            event: "logout",
            userId: session.userId,
            ipAddress: context?.request?.headers?.get("x-forwarded-for") ?? null,
            userAgent: context?.request?.headers?.get("user-agent") ?? null,
          });
        },
      },
    },
  },
});
