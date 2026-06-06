import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { getRequestContext } from "../common/utils/requestContext.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const basePrisma = new PrismaClient({
  adapter,
  log: ["query", "error", "warn"],
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
