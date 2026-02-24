'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default icons
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconAnchor: [12, 41]
})

export default function MapCore({ lat, lng }: { lat: number, lng: number }) {
    // Safe defaults for FairBid
    const position: [number, number] = [lat || 10.391, lng || -75.479]

    return (
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position} icon={icon}>
                <Popup>Tu Pedido</Popup>
            </Marker>
            {/* Simulated Driver */}
            <Marker position={[position[0] + 0.005, position[1] + 0.005]} icon={icon}>
                <Popup>Conductor</Popup>
            </Marker>
        </MapContainer>
    )
}
