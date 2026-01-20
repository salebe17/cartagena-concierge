"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export default function HeroAnimation() {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        // Esta es la URL de la moto en 3D
        fetch("https://lottie.host/5e000958-6927-4402-9904-54736183592c/6uF6ZtYlqX.json")
            .then((res) => {
                if (!res.ok) throw new Error("Error loading animation");
                return res.json();
            })
            .then((data) => setAnimationData(data))
            .catch((err) => console.error("Error cargando la moto:", err));
    }, []);

    if (!animationData) return null;

    return (
        <div className="w-full max-w-[500px] mx-auto md:mr-0 transform hover:scale-105 transition duration-500">
            <Lottie
                animationData={animationData}
                loop={true}
                className="w-full h-auto drop-shadow-2xl"
            />
        </div>
    );
}
