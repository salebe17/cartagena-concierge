'use client'

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'

// Fix for default icons
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconAnchor: [12, 41]
})

function DraggableMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
    const markerRef = useRef<L.Marker>(null)
    const map = useMap()

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng()
                    setPosition([lat, lng])
                }
            },
        }),
        [setPosition],
    )

    // Pan map when position changes externally (e.g. via GPS button)
    useEffect(() => {
        map.panTo(position)
    }, [position, map])

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={icon}
        />
    )
}

export default function LocationPickerCore({
    lat,
    lng,
    onChange
}: {
    lat: number,
    lng: number,
    onChange: (lat: number, lng: number) => void
}) {
    // Safe defaults for Cartagena
    const [position, setPosition] = useState<[number, number]>([lat || 10.391, lng || -75.479])

    // Sync external props to internal state
    useEffect(() => {
        if (lat && lng) {
            setPosition([lat, lng])
        }
    }, [lat, lng])

    const handleUpdate = (pos: [number, number]) => {
        setPosition(pos)
        onChange(pos[0], pos[1])
    }

    return (
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <DraggableMarker position={position} setPosition={handleUpdate} />
        </MapContainer>
    )
}
