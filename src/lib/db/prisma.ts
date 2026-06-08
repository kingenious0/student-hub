import { PrismaClient, Prisma } from '@prisma/client'

// Ensure Decimal serializes as number in JSON (not "60.00" string)
// This prevents breaking frontend code that calls .toFixed() on price
if (Prisma.Decimal?.prototype?.toJSON) {
    Prisma.Decimal.prototype.toJSON = function () { return Number(this); } as any;
}

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
