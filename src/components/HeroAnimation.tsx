'use client'

import React, { useEffect, useState } from 'react'
import Lottie from 'lottie-react'

export default function HeroAnimation() {
    const [animationData, setAnimationData] = useState(null)

    useEffect(() => {
        fetch('https://lottie.host/5e000958-6927-4402-9904-54736183592c/6uF6ZtYlqX.json')
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error("Animation failed to load", err))
    }, [])

    if (!animationData) {
        return (
            <div className="w-64 h-64 bg-zinc-900/10 rounded-full animate-pulse mx-auto blur-xl opacity-50"></div>
        )
    }

    return (
        <div className="w-full max-w-[450px] mx-auto drop-shadow-2xl filter hover:scale-105 transition-transform duration-700 ease-in-out">
            <Lottie
                animationData={animationData}
                loop={true}
                className="w-full h-full"
            />
        </div>
    )
}
