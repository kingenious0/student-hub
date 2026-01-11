'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useModal } from '@/context/ModalContext';
import { MapContainer, TileLayer, Marker, useMap, LayersControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default marker icon missing assets in webpack
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    onLocationSelect: (coords: { lat: number; lng: number }, address: string, osmData?: { osmId?: string, placeId?: string }) => void;
    initialLat?: number;
    initialLng?: number;
}

const AAMUSTED_CENTER: [number, number] = [6.669, -1.679];

// Component to handle map center updates when props change or search happens
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 17);
    }, [center, map]);
    return null;
}

// Component to handle marker drag events and map clicks
function DraggableMarker({ position, onPositionChange }: { position: [number, number], onPositionChange: (lat: number, lng: number) => void }) {
    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    onPositionChange(lat, lng);
                }
            },
        }),
        [onPositionChange],
    );

    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const { alert } = useModal();

    // Default to AAMUSTED if no props provided
    const [selectedLocation, setSelectedLocation] = useState<[number, number]>(
        (initialLat && initialLng) ? [initialLat, initialLng] : AAMUSTED_CENTER
    );

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [pickedAddress, setPickedAddress] = useState<string | null>(null);
    const [pickedOsmData, setPickedOsmData] = useState<{ osmId?: string, placeId?: string } | undefined>(undefined);

    const emitLocation = (lat: number, lng: number, address: string | null, osmData: any) => {
        const finalAddress = address || `Pinned Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        onLocationSelect(
            { lat, lng },
            finalAddress,
            osmData
        );
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query) return;

        const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;
        if (!apiKey) console.warn("LocationIQ API Key missing");

        setIsSearching(true);
        setSuggestions([]);

        try {
            const url = `https://api.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(query)}&countrycodes=gh&limit=5&dedupe=1&format=json`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const selectSuggestion = (item: any) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        setSelectedLocation([lat, lon]);
        setQuery(item.display_name);
        setPickedAddress(item.display_name);

        const osmData = { osmId: item.osm_id, placeId: item.place_id };
        setPickedOsmData(osmData);
        setSuggestions([]);

        // Emit immediately
        emitLocation(lat, lon, item.display_name, osmData);
    };

    const onMarkerMove = async (lat: number, lng: number) => {
        setSelectedLocation([lat, lng]);

        const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;
        if (!apiKey) {
            emitLocation(lat, lng, null, undefined);
            return;
        }

        try {
            const url = `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${lat}&lon=${lng}&format=json`;
            const res = await fetch(url);

            if (res.ok) {
                const data = await res.json();
                const name = data.display_name || `Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;

                setPickedAddress(name);
                setQuery(name); // Update search bar to reflect dragged location

                const osmData = data.osm_id ? { osmId: data.osm_id, placeId: data.place_id } : undefined;
                setPickedOsmData(osmData);

                emitLocation(lat, lng, name, osmData);
            } else {
                emitLocation(lat, lng, null, undefined);
            }
        } catch (error) {
            console.error("Reverse geocoding failed", error);
            emitLocation(lat, lng, null, undefined);
        }
    };

    // Initial emit if props provided
    useEffect(() => {
        if (initialLat && initialLng) {
            emitLocation(initialLat, initialLng, null, undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col gap-4 w-full h-full relative">
            {/* Search Bar */}
            <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2">
                <form onSubmit={handleSearch} className="flex shadow-lg">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for your hall (e.g. Atwima)..."
                        className="flex-1 p-3 rounded-l-lg border-none focus:ring-2 ring-blue-500 bg-white text-black text-sm"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg font-bold disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {isSearching ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : 'Search'}
                    </button>
                </form>

                {suggestions.length > 0 && (
                    <ul className="bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto text-black border border-gray-200">
                        {suggestions.map((item, idx) => (
                            <li
                                key={idx}
                                onClick={() => selectSuggestion(item)}
                                className="p-3 hover:bg-gray-100 cursor-pointer border-b text-sm flex flex-col"
                            >
                                <span className="font-bold text-gray-800">{item.display_name.split(',')[0]}</span>
                                <span className="text-xs text-gray-500 truncate">{item.display_name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Leaflet Map */}
            <div className="flex-1 rounded-lg overflow-hidden border border-gray-300 z-0">
                <MapContainer
                    center={selectedLocation}
                    zoom={17}
                    style={{ height: '100%', width: '100%' }}
                >
                    <MapUpdater center={selectedLocation} />
                    <LayersControl position="bottomright">
                        <LayersControl.BaseLayer checked name="Standard Streets (OSM)">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satellite (Esri)">
                            <TileLayer
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>
                    <DraggableMarker position={selectedLocation} onPositionChange={onMarkerMove} />
                </MapContainer>
            </div>
        </div>
    );
}
