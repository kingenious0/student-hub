'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from '@/lib/location/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationPickerProps {
    onLocationSelect: (coords: { lat: number; lng: number }, address: string) => void;
    initialLat?: number;
    initialLng?: number;
}

const DEFAULT_CENTER = [-1.6795, 6.6967]; // AAMUSTED Campus roughly

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: (initialLat && initialLng) ? [initialLng, initialLat] : (DEFAULT_CENTER as [number, number]),
            zoom: 15,
        });

        const marker = new mapboxgl.Marker({ color: '#FF5733', draggable: false })
            .setLngLat((initialLat && initialLng) ? [initialLng, initialLat] : (DEFAULT_CENTER as [number, number]))
            .addTo(map.current);

        // Update marker on move
        map.current.on('move', () => {
            if (!map.current) return;
            const center = map.current.getCenter();
            marker.setLngLat(center);
        });

        map.current.on('moveend', () => {
            if (!map.current) return;
            const center = map.current.getCenter();

            // Update internal state
            setSelectedLocation({ lat: center.lat, lng: center.lng });

            // Reverse geocode to get address (optional, usually good UX)
            // For now, we'll just return coords, or fetch address if needed
            // To keep it fast, we might trigger this only on manual confirm.
        });

    }, [initialLat, initialLng]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        const token = mapboxgl.accessToken;
        try {
            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&proximity=${DEFAULT_CENTER[0]},${DEFAULT_CENTER[1]}&country=GH`);
            const data = await res.json();
            setSuggestions(data.features || []);
        } catch (err) {
            console.error("Geocoding failed", err);
        }
    };

    const selectSuggestion = (feature: any) => {
        if (!map.current) return;
        const [lng, lat] = feature.center;
        map.current.flyTo({ center: [lng, lat], zoom: 17 });
        setSuggestions([]);
        setQuery(feature.place_name);

        // Trigger update
        setSelectedLocation({ lat, lng });
    };

    const handleConfirm = async () => {
        if (!selectedLocation) return;

        // Perform one last reverse geocode to get a clean address for the center point
        let address = query; // Default to search query

        try {
            const token = mapboxgl.accessToken;
            const { lng, lat } = selectedLocation;
            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`);
            const data = await res.json();
            if (data.features && data.features.length > 0) {
                address = data.features[0].place_name;
            }
        } catch (err) {
            console.error("Reverse geocode failed", err);
        }

        onLocationSelect(selectedLocation, address);
    };

    return (
        <div className="flex flex-col gap-4 w-full h-[500px] relative">
            {/* Search Bar */}
            <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2">
                <form onSubmit={handleSearch} className="flex shadow-lg">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for your hall or building..."
                        className="flex-1 p-3 rounded-l-lg border-none focus:ring-2 ring-blue-500 bg-white text-black"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 rounded-r-lg font-bold">Search</button>
                </form>

                {suggestions.length > 0 && (
                    <ul className="bg-white rounded-lg shadow-lg max-h-40 overflow-y-auto text-black">
                        {suggestions.map((feat) => (
                            <li
                                key={feat.id}
                                onClick={() => selectSuggestion(feat)}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b text-sm"
                            >
                                {feat.place_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Map */}
            <div ref={mapContainer} className="flex-1 rounded-lg overflow-hidden border border-gray-300" />

            {/* Center Pin Overlay (if not using marker logic, but we used marker logic) */}
            {/* Visual cue that the marker is the center */}

            <button
                type="button"
                onClick={handleConfirm}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-bold shadow-lg w-full"
            >
                Confirm Location
            </button>
        </div>
    );
}
