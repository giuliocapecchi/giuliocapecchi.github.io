import React, { useEffect, useState } from "react";
import { Project } from "@/types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faGithubSquare } from "@fortawesome/free-brands-svg-icons";

interface PortfolioProps {
    projects: Project[],
    isMobileState?: boolean;
}


const Portfolio: React.FC<PortfolioProps> = ({ projects, isMobileState = false }) => {
    const [fadeIn, setFadeIn] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    
    useEffect(() => { // check for very small screens
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 380);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    
    const itemsPerPage = isSmallScreen ? 3 : 4;

    useEffect(() => {
        setFadeIn(false);
        const timeout = setTimeout(() => setFadeIn(true), 100);
        return () => clearTimeout(timeout);
    }, [currentIndex]);

    // remove README project from the list and sort by date
    const filteredProjects = projects.filter((project) => project.name !== 'giuliocapecchi');
    const sortedProjects = [...filteredProjects].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // calculate the current projects to display
    const currentProjects = sortedProjects.slice(
        currentIndex,
        currentIndex + itemsPerPage
    );

    const textSize = isMobileState ? "text-sm" : "text-lg";
    const headerSize = isMobileState ? "text-lg" : "text-2xl";

    // navigation functions
    const handleNext = () => {
        setCurrentIndex((prev) => prev + itemsPerPage);
    };
    const handleGoBack = () => {
        setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));
    };


    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;
    const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);

    return (
        <div
            className={`portfolio transition-opacity duration-500 ${fadeIn ? "opacity-100" : "opacity-0"
            } text-white text-center p-3 rounded-lg max-w-4xl mx-auto ${isMobileState ? 'h-[480px]' : 'h-[500px]'} relative flex flex-col items-center pt-16`}
            style={{
            backgroundColor: `transparent`,
            }}
        >
            <h1 className={`${headerSize} mb-24 absolute top-8`}>Recent Projects</h1>
            {currentProjects.map((project) => (
            <li
                key={project.id}
                className={`mt-6 flex flex-col items-top`}
            >
                <a
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-bold hover:text-sky-400/80 transition-colors duration-300 flex items-center justify-center ${textSize}`}
                >
                <FontAwesomeIcon icon={faGithubSquare} size="lg" className="mr-2" />
                {project.name}
                </a>
                {project.description && (
                <p className={`mt-2 text-gray-300 text-center ${textSize}`}>
                    {project.description}
                </p>
                )}
            </li>
            ))}
            {/* Navigation */}
            <div className="flex justify-between mt-4 absolute bottom-4 left-8 right-8 items-center z-20">
            {currentIndex > 0 && (
                <button
                onClick={handleGoBack}
                className="text-white hover:text-sky-400 transition-colors duration-300 text-xl"
                >
                <FontAwesomeIcon icon={faArrowLeft} />
                </button>
            )}
            <span className="text-white absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                {currentPage} / {totalPages}
            </span>
            {currentIndex + itemsPerPage < sortedProjects.length && (
                <button
                onClick={handleNext}
                className="text-white hover:text-sky-400 transition-colors duration-300 text-xl ml-auto"
                >
                <FontAwesomeIcon icon={faArrowRight} />
                </button>
            )}
            </div>
        </div>
    );
};

export default Portfolio;
