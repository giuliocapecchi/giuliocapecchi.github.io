"use client";

import React, { useState, useEffect, Suspense, lazy } from "react";
import LeftSection from "../components/LeftSection";
import Portfolio from "../components/Portfolio";
import BackgroundControls from "@/components/BackgroundControls";
import Loading from "../components/Loading";
import { isMobile } from 'react-device-detect';

const BlizzardThreeScene = lazy(() => import("../components/BlizzardThreeScene"));
const NNThreeScene = lazy(() => import("@/components/NNThreeScene"));
const LairThreeScene = lazy(() => import("@/components/LairThreeScene"));

const Home: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [projects, setProjects] = useState([]);
    const [showPortfolio, setShowPortfolio] = useState(false);
    const [velocity, setVelocity] = useState(0.3);
    const [backgroundChoice, setBackgroundChoice] = useState("Lair"); // Default background
    const [isMobileState, setIsMobileState] = useState(false); // Client-side mobile detection

    useEffect(() => {
        setIsMobileState(isMobile);
        
        // Fetch projects data
        const fetchProjects = async () => {
            try {
                const response = await fetch(
                    "https://api.github.com/users/giuliocapecchi/repos"
                );
                const data = await response.json();
                setProjects(data);
            } catch (error) {
                console.error("Error fetching GitHub repositories:", error);
            } finally {
                // Faster loading transition
                setTimeout(() => setFadeOut(true), 300); 
                setTimeout(() => {
                    setLoading(false);
                    setFadeIn(true);
                }, 600);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return <Loading fadeOut={fadeOut} />;
    }

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background Scene */}
            <div className="three-scene-container h-screen w-full">
                <Suspense fallback={<div className="w-full h-full bg-black" />}>
                    {backgroundChoice === "Blizzard" ? (
                        <BlizzardThreeScene velocity={velocity} />
                    ) : backgroundChoice === "Neurons" ? (
                        <NNThreeScene velocity={velocity} />
                    ) : (
                    <LairThreeScene velocity={velocity} />
                    )}
                </Suspense>
            </div>

            {/* Main Content */}
            <div className={`relative z-10 flex flex-col ${isMobileState ? 'justify-start p-3 mt-9' : 'justify-center items-center p-3'} w-full h-full`}>
                <div className="flex flex-col md:flex-row justify-center gap-10 w-full max-w-7xl">
                    {/* Left Section */}
                    <div
                        className={`transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} flex-1 ${showPortfolio ? 'hidden' : 'block'} sm:w-full md:w-1/2 bg-white/[0.02] backdrop-blur-md border border-white/15 shadow-sm rounded-3xl glassmorphism-panel relative overflow-hidden ${isMobileState ? 'mt-20' : ''}`}
                    >
                        {/* glass effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/[0.01] rounded-3xl pointer-events-none"></div>
                        {/* top reflection */}
                        <div className="absolute inset-[1px] bg-gradient-to-b from-white/10 via-transparent to-transparent rounded-[calc(1.5rem-1px)] pointer-events-none opacity-30"></div>
                        <div className="relative z-10">
                            <LeftSection />
                        </div>
                    </div>

                    {/* Portfolio Section - Visibility based on showPortfolio */}
                    <div
                        className={`transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} flex-1 ${showPortfolio ? 'block' : 'hidden'} md:block sm:w-full md:w-1/2 bg-white/[0.02] backdrop-blur-md border border-white/15 shadow-sm rounded-3xl glassmorphism-panel relative overflow-hidden ${isMobileState ? 'mt-20' : ''}`}
                    >
                        {/* glass effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/[0.01] rounded-3xl pointer-events-none"></div>
                        {/* top reflection */}
                        <div className="absolute inset-[1px] bg-gradient-to-b from-white/10 via-transparent to-transparent rounded-[calc(1.5rem-1px)] pointer-events-none opacity-30"></div>
                        <div className="relative z-10">
                            <Portfolio projects={projects} backgroundChoice={backgroundChoice} isMobileState={isMobileState} />
                        </div>
                    </div>
                </div>

                {/* Background Controls */}
                <div
                    className={`transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} fixed bottom-1 left-3 z-20`}
                >
                    <BackgroundControls
                        velocity={velocity}
                        onVelocityChange={setVelocity}
                        backgroundChoice={backgroundChoice}
                        onBackgroundChoiceChange={setBackgroundChoice} // Callback to change the background
                    />
                </div>

                {/* Toggle Button for Mobile */}
                <button
                    className="block md:hidden fixed bottom-5 right-5 bg-blue-500/50 text-white p-2 rounded z-20"
                    onClick={() => setShowPortfolio(!showPortfolio)}
                >
                    {showPortfolio ? 'About me' : 'Portfolio'}
                </button>
            </div>
            {/* Page View Counter */}
        </div>
    );
};

export default Home;