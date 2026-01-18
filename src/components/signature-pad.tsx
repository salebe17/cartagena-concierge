'use client'

import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'

interface SignaturePadProps {
    onSave: (dataUrl: string) => void
}

export function SignaturePad({ onSave }: SignaturePadProps) {
    const sigPad = useRef<SignatureCanvas>(null)
    const [isEmpty, setIsEmpty] = useState(true)

    const clear = () => {
        sigPad.current?.clear()
        setIsEmpty(true)
    }

    const save = () => {
        if (sigPad.current && !sigPad.current.isEmpty()) {
            onSave(sigPad.current.getTrimmedCanvas().toDataURL('image/png'))
        }
    }

    return (
        <div className="space-y-4">
            <div className="border border-zinc-700 bg-zinc-900 rounded-lg overflow-hidden">
                <SignatureCanvas
                    ref={sigPad}
                    penColor="white"
                    backgroundColor="rgba(0,0,0,0)"
                    canvasProps={{
                        className: 'w-full h-40 cursor-crosshair'
                    }}
                    onBegin={() => setIsEmpty(false)}
                />
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={clear} className="flex-1 text-zinc-400 border-zinc-700 hover:text-white">
                    Clear
                </Button>
                <Button onClick={save} disabled={isEmpty} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                    Confirm Signature
                </Button>
            </div>
        </div>
    )
}
