'use client'

import dynamic from 'next/dynamic'

// THIS is where ssr: false belongs
const MapCore = dynamic(() => import('./map-core'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-zinc-100 flex items-center justify-center text-zinc-500">Cargando Mapa...</div>
})

export default function TrackingMap({ lat, lng }: { lat: number; lng: number }) {
    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border">
            <MapCore lat={lat} lng={lng} />
        </div>
    )
}
