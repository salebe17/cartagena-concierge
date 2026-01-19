'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const LocationPickerCore = dynamic(
    () => import('./location-picker-core'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading Map...</span>
            </div>
        )
    }
)

interface LocationPickerProps {
    lat: number
    lng: number
    onChange: (lat: number, lng: number) => void
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
    return <LocationPickerCore lat={lat} lng={lng} onChange={onChange} />
}
