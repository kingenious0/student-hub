
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';


const prismaClientSingleton = () => {
    // Ensure we have a URL for the build verification step, using a dummy if missing
    const connectionUrl = process.env.PRISMA_ACCELERATE_URL || process.env.DATABASE_URL || 'prisma://accelerate.prisma-data.net/?api_key=dummy_for_build';

    return new PrismaClient({
        datasourceUrl: connectionUrl,
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
