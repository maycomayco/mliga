import { PrismaClient, Role } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { scryptSync, randomBytes } from "crypto";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

const users: {
  email: string;
  name: string;
  username: string;
  password: string;
  role: Role;
}[] = [
  {
    email: "maycobarale@gmail.com",
    name: "Mayco",
    username: "mayco",
    password: "0112358132",
    role: Role.ADMIN,
  },
  {
    email: "jano@aaa.com",
    name: "Jano",
    username: "jano.vino",
    password: "0123456789",
    role: Role.USER,
  },
  {
    email: "victor@aaa.com",
    name: "Victor",
    username: "victor.voleadefondo",
    password: "0123456789",
    role: Role.USER,
  },
  {
    email: "santi@aaa.com",
    name: "Santi",
    username: "santi.profe",
    password: "0123456789",
    role: Role.USER,
  },
  {
    email: "lucas@aaa.com",
    name: "Lucas",
    username: "lucas.sinescalas",
    password: "0123456789",
    role: Role.USER,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const user of users) {
    const hashedPassword = hashPassword(user.password);

    const createdOrUpdatedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        username: normalizeUsername(user.username),
        password: hashedPassword,
        emailVerified: true,
        role: user.role,
      },
    });

    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: createdOrUpdatedUser.id,
        },
      },
      update: {
        password: hashedPassword,
        userId: createdOrUpdatedUser.id,
      },
      create: {
        userId: createdOrUpdatedUser.id,
        accountId: createdOrUpdatedUser.id,
        providerId: "credential",
        password: hashedPassword,
      },
    });

    console.log(`  ✓ ${user.name} (${user.email})`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
