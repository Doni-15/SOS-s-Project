import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "./env.js";
import { getRequestContext } from "../common/utils/requestContext.js";

const adapter = new PrismaPg({
  connectionString: env.databaseUrl,
});

const prismaLogLevels =
  env.nodeEnv === "production" ? ["error", "warn"] : ["query", "error", "warn"];

const basePrisma = new PrismaClient({
  adapter,
  log: prismaLogLevels,
});

export const prisma = basePrisma.$extends({
  query: {
    auditLog: {
      create({ args, query }) {
        const context = getRequestContext();

        if (context) {
          args.data = {
            ...args.data,
            ipAddress: args.data.ipAddress ?? context.ipAddress,
            userAgent: args.data.userAgent ?? context.userAgent,
          };
        }

        return query(args);
      },
    },
  },
});
