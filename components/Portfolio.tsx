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
    const [isShortViewport, setIsShortViewport] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 380);
            setIsShortViewport(window.innerHeight < 600);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const itemsPerPage = isShortViewport ? 2 : isSmallScreen ? 3 : 4;

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
            } text-white text-center ${isShortViewport ? 'p-3' : 'p-6'} rounded-lg max-w-4xl mx-auto ${isShortViewport ? 'min-h-0' : isMobileState ? 'min-h-[min(500px,calc(100vh-2rem))]' : 'min-h-[min(520px,calc(100vh-2rem))]'} max-h-[calc(100vh-2rem)] flex flex-col`}
        >
            <h1 className={`${headerSize} mb-4`}>Recent Projects</h1>
            <ul className="flex flex-col gap-3 w-full">
            {currentProjects.map((project) => (
            <li
                key={project.id}
                className="w-full flex"
            >
                <a
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 block bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200 text-left"
                >
                <span className={`font-semibold flex items-center gap-2 ${textSize}`}>
                    <FontAwesomeIcon icon={faGithubSquare} className="text-white/50 shrink-0" />
                    <span className="hover:text-sky-400 transition-colors duration-200">{project.name}</span>
                </span>
                {project.description && (
                <p className={`mt-1 text-white/50 ${textSize === 'text-lg' ? 'text-sm' : 'text-xs'}`}>
                    {project.description}
                </p>
                )}
                </a>
            </li>
            ))}
            </ul>
            {/* Navigation */}
            <div className="flex justify-between mt-auto pt-4 items-center">
            <button
                onClick={handleGoBack}
                aria-label="Previous page"
                className={`text-white hover:text-sky-400 transition-colors duration-300 text-xl ${currentIndex === 0 ? 'invisible' : ''}`}
            >
                <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <span className="text-white/60 text-sm">
                {currentPage} / {totalPages}
            </span>
            <button
                onClick={handleNext}
                aria-label="Next page"
                className={`text-white hover:text-sky-400 transition-colors duration-300 text-xl ${currentIndex + itemsPerPage >= sortedProjects.length ? 'invisible' : ''}`}
            >
                <FontAwesomeIcon icon={faArrowRight} />
            </button>
            </div>
        </div>
    );
};

export default Portfolio;
