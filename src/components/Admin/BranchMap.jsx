import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Button from '../UI/Button';

// Fix default icon issue with Leaflet in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Internal component to handle map clicks and sync with parent state
const LocationMarker = ({ position, setPosition, radius }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    const eventHandlers = {
        dragend: (e) => {
            const marker = e.target;
            if (marker != null) {
                setPosition(marker.getLatLng());
            }
        },
    };

    return position === null ? null : (
        <>
            <Marker
                position={position}
                draggable={true}
                eventHandlers={eventHandlers}
            >
                <Popup>Branch Location</Popup>
            </Marker>
            <Circle center={position} radius={radius} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }} />
        </>
    )
};

// Component helper to recenter map when props change
const MapRecenter = ({ position }) => {
    const map = useMapEvents({});
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);
    return null;
}

const BranchMap = ({ lat, lng, radius, onChange }) => {
    // Default to Center of India if no lat/lng provided
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };
    const [position, setPosition] = useState(lat && lng ? { lat, lng } : null);

    // Sync internal state with props
    useEffect(() => {
        if (lat && lng) {
            setPosition({ lat, lng });
        }
    }, [lat, lng]);

    const handleUpdatePosition = (newPos) => {
        setPosition(newPos);
        onChange(newPos.lat, newPos.lng);
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    handleUpdatePosition({ lat: latitude, lng: longitude });
                },
                (err) => {
                    alert("Could not get your location. Please ensure location services are enabled.");
                    console.error(err);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Location Map</label>
                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Use My Current Location
                </button>
            </div>

            <div className="h-[350px] w-full rounded-md overflow-hidden border border-gray-300 shadow-sm relative z-0">
                <MapContainer center={position || defaultCenter} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={handleUpdatePosition} radius={radius} />
                    {position && <MapRecenter position={position} />}
                </MapContainer>
            </div>
            <p className="text-xs text-gray-500">Click on the map or drag the marker to set the precise location.</p>
        </div>
    );
};

export default BranchMap;
