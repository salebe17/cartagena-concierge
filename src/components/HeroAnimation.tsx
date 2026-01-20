"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroAnimation() {
    return (
        <div className="w-full max-w-[500px] mx-auto md:mr-0 relative z-20">

            {/* Glow Effect Behind */}
            <div className="absolute inset-0 bg-cyan-500/20 blur-[80px] rounded-full scale-90 animate-pulse"></div>

            <motion.div
                initial={{ y: 0 }}
                animate={{
                    y: [-15, 15, -15],
                    rotate: [0, 1, -1, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative z-10 drop-shadow-2xl"
            >
                <Image
                    src="/premium_scooter.png"
                    alt="Premium Delivery Scooter"
                    width={600}
                    height={600}
                    className="w-full h-auto object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    priority
                />
            </motion.div>
        </div>
    );
}
