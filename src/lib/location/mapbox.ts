import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
    console.warn('Mapbox Token is missing!');
} else {
    mapboxgl.accessToken = MAPBOX_TOKEN;
}

export const getMapboxToken = () => MAPBOX_TOKEN || '';

export default mapboxgl;
