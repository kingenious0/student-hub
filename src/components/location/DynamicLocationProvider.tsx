'use client';

import dynamic from 'next/dynamic';

const LocationProvider = dynamic(() => import('./LocationProvider'), {
    ssr: false
});

export default LocationProvider;
