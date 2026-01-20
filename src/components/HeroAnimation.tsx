"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export default function HeroAnimation() {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        // Esta URL es de una Scooter de Delivery Premium (Estilo Uber/Rappi)
        fetch("https://lottie.host/5e000958-6927-4402-9904-54736183592c/6uF6ZtYlqX.json")
            .then((res) => {
                if (!res.ok) throw new Error("Error loading animation");
                return res.json();
            })
            .then((data) => setAnimationData(data))
            .catch((err) => {
                console.error("Error cargando la moto:", err);
                // Fallback: Si falla la URL, intenta con esta otra de respaldo
                fetch("https://assets5.lottiefiles.com/packages/lf20_6wjmzavt.json")
                    .then(r => r.json())
                    .then(d => setAnimationData(d));
            });
    }, []);

    if (!animationData) return null; // O un spinner invisible

    return (
        <div className="w-full max-w-[500px] mx-auto md:mr-0">
            <Lottie
                animationData={animationData}
                loop={true}
                className="w-full h-auto drop-shadow-2xl filter"
            />
        </div>
    );
}
