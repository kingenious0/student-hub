
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';


const prismaClientSingleton = () => {
    const url = process.env.PRISMA_ACCELERATE_URL || process.env.DATABASE_URL;

    if (!url || !url.startsWith('prisma://')) {
        console.error('CRITICAL: Missing or Invalid Prisma Accelerate URL. Ensure DATABASE_URL starts with "prisma://". Current value:', url ? 'Set (Hidden)' : 'Unset');
    } else {
        if (process.env.NODE_ENV === 'development') console.log('✅ Prisma Accelerate Client Initialized');
    }

    return new PrismaClient({
        accelerateUrl: url,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    } as any).$extends(withAccelerate());
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
