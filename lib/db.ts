// lib/db.ts

import { PrismaClient } from "@prisma/client";  
import { PrismaNeon } from "@prisma/adapter-neon";
// Import the Prisma client so we can connect to the database

declare global {
  var prisma: PrismaClient | undefined;
  // Tell TypeScript that a global variable named "prisma" exists
  // This prevents TypeScript errors when we use globalThis.prisma
}


const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });


export const db = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

