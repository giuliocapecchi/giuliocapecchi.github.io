"use client";

import React, { useState, useEffect } from "react";
import BlizzardThreeScene from "../components/BlizzardThreeScene";
import NNThreeScene from "@/components/NNThreeScene";
import LeftSection from "../components/LeftSection";
import Portfolio from "../components/Portfolio";
import BackgroundControls from "@/components/BackgroundControls";
import Loading from "../components/Loading";
import { metadata } from "./metadata";
import { isMobile } from 'react-device-detect';
import Lair from "@/components/LairThreeScene";

const Home: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [projects, setProjects] = useState([]);
    const [showPortfolio, setShowPortfolio] = useState(false);
    const [velocity, setVelocity] = useState(0.3);
    const [backgroundChoice, setBackgroundChoice] = useState( // random choice of starting background
        ["Blizzard", "Neurons", "Lair"][Math.floor(Math.random() * 3)]
    ); 

    useEffect(() => {
        document.title = metadata.title;

        const metaDescription = document.querySelector("meta[name='description']");
        if (metaDescription) {
            metaDescription.setAttribute("content", metadata.description);
        } else {
            const meta = document.createElement("meta");
            meta.name = "description";
            meta.content = metadata.description;
            document.head.appendChild(meta);
        }

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
                setTimeout(() => setFadeOut(true), 500); // Trigger fade-out of the loader
                setTimeout(() => {
                    setLoading(false);
                    setFadeIn(true); // Trigger fade-in for the content
                }, 1000); // Wait for the fade-out animation to finish
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
                {backgroundChoice === "Blizzard" ? (
                    <BlizzardThreeScene velocity={velocity} />
                ) : backgroundChoice === "Neurons" ? (
                    <NNThreeScene velocity={velocity} />
                ) : (
                <Lair velocity={velocity} />
                )}
            </div>

            {/* Main Content */}
            <div className={`relative z-10 flex flex-col ${isMobile ? 'justify-start p-3 mt-9' : 'justify-center items-center p-3'} w-full h-full`}>
                <div className="flex flex-col md:flex-row justify-center gap-10 w-full max-w-7xl">
                    {/* Left Section */}
                    <div
                        className={`transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} flex-1 ${showPortfolio ? 'hidden' : 'block'} sm:w-full md:w-1/2`}
                    >
                        <LeftSection backgroundChoice={backgroundChoice}/>
                    </div>

                    {/* Portfolio Section - Visibility based on showPortfolio */}
                    <div
                        className={`transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} flex-1 ${showPortfolio ? 'block' : 'hidden'} md:block sm:w-full md:w-1/2`}
                    >
                        <Portfolio projects={projects} backgroundChoice={backgroundChoice}  />
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
            {/* <div className={`fixed ${isMobile ? 'hidden' : ''} bottom-4 right-4 z-10`}>
                <img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fgiuliocapecchi.github.io&count_bg=%23B5E0FC&title_bg=%238387E7&icon=github.svg&icon_color=%23D2D2D2&title=views&edge_flat=false" alt="Page views" className={`${isMobile ? 'w-full' : ''}`} />

            </div> */}
        </div>
    );
};

export default Home;