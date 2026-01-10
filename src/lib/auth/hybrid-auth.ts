import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

export async function getHybridUser() {
    const { userId } = await auth();

    if (userId) return { userId };

    // Fallback: Check Hybrid Cookies set by the native sync bridge
    const cookieStore = await cookies();
    const verified = cookieStore.get('OMNI_IDENTITY_VERIFIED');
    const clerkId = cookieStore.get('OMNI_HYBRID_SYNCED');

    if (verified?.value === 'TRUE' && clerkId?.value) {
        return { userId: clerkId.value, isHybrid: true };
    }

    return { userId: null };
}
