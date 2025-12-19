// src/lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Singleton pattern for PrismaClient
// This prevents multiple instances in development with hot reload
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

// Create PostgreSQL connection pool for CockroachDB
const pool =
    globalForPrisma.pool ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
    });

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma Client with adapter
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    globalForPrisma.pool = pool;
}
