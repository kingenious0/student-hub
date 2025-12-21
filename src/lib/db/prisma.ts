
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';


const prismaClientSingleton = () => {
    const url = process.env.PRISMA_ACCELERATE_URL || process.env.DATABASE_URL || 'prisma://accelerate.prisma-data.net/?api_key=dummy_build_key';

    if (typeof process !== 'undefined' && process.env) {
        process.env.DATABASE_URL = url;
    }

    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    }).$extends(withAccelerate());
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
