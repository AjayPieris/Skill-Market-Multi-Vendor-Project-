// lib/db.ts

import { PrismaClient } from "@prisma/client";  
// Import the Prisma client so we can connect to the database

declare global {
  var prisma: PrismaClient | undefined;
  // Tell TypeScript that a global variable named "prisma" exists
  // This prevents TypeScript errors when we use globalThis.prisma
}

// Create a new Prisma client OR reuse the existing one (important for Next.js development)
export const db = globalThis.prisma || new PrismaClient();
// If globalThis.prisma already exists → use it
// If not → create a new PrismaClient()

// In development, save the prisma client to globalThis so it can be reused
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
// This prevents creating too many database connections when the server reloads
// In production we don't store it globally, we create it cleanly
