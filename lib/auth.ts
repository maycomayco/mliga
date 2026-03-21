import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins/username";
import { scryptSync, timingSafeEqual, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

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
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
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
  plugins: [nextCookies(), username()],
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
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/username": {
        window: 60,
        max: 5,
      },
    },
  },
});
