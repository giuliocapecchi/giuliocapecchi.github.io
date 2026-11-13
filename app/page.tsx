"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LeftSection from "@/components/LeftSection";
import Portfolio from "@/components/Portfolio";
import BackgroundControls from "@/components/BackgroundControls";

const Lair = dynamic(() => import("@/components/LairThreeScene"), { ssr: false });
const Neurons = dynamic(() => import("@/components/NNThreeScene"), { ssr: false });
const Blizzard = dynamic(() => import("@/components/BlizzardThreeScene"), { ssr: false });

export default function Home() {
    const [showPortfolio, setShowPortfolio] = useState(false);
    const [velocity, setVelocity] = useState(0.3);
    // Keep the initial HTML independent of WebGL and browser preferences.
    const [backgroundChoice, setBackgroundChoice] = useState("Still");

    useEffect(() => {
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        if (!motion.matches && !connection?.saveData) setBackgroundChoice("Lair");
        const onMotionChange = () => {
            if (motion.matches) setBackgroundChoice("Still");
        };
        motion.addEventListener("change", onMotionChange);
        return () => motion.removeEventListener("change", onMotionChange);
    }, []);

    return (
        <div className="relative w-full h-dvh">
            <a href="#main-content" className="skip-link">Skip to content</a>
            <div className="three-scene-container" aria-hidden="true">
                {backgroundChoice === "Lair" && <Lair velocity={velocity} />}
                {backgroundChoice === "Neurons" && <Neurons velocity={velocity} />}
                {backgroundChoice === "Blizzard" && <Blizzard velocity={velocity} />}
            </div>

            <main id="main-content" className="relative z-10 flex flex-col justify-center items-center px-3 w-full h-full safe-area-padding">
                <div className="content-panels flex flex-col md:flex-row items-stretch gap-6 w-full max-w-7xl min-h-0">
                    <section aria-label="About me" className={`content-panel ${showPortfolio ? 'hidden' : 'flex'} md:flex`}>
                        <LeftSection />
                    </section>
                    <section id="projects" aria-labelledby="projects-heading" className={`content-panel ${showPortfolio ? 'flex' : 'hidden'} md:flex`}>
                        <Portfolio />
                    </section>
                </div>
            </main>

            <div className="fixed safe-bottom left-4 z-20">
                <BackgroundControls velocity={velocity} onVelocityChange={setVelocity}
                    backgroundChoice={backgroundChoice} onBackgroundChoiceChange={setBackgroundChoice} />
            </div>
            <button className="md:hidden fixed safe-bottom right-5 z-20 glass-button"
                onClick={() => setShowPortfolio(!showPortfolio)} aria-pressed={showPortfolio}
                aria-controls="projects" aria-label={showPortfolio ? 'Show about' : 'Show portfolio'}>
                {showPortfolio ? 'About me' : 'Portfolio'}
            </button>
            <div className="rotate-notice" role="alert">
                <p>Please rotate your phone to portrait mode.</p>
            </div>
        </div>
    );
}
