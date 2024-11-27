import React, { useEffect, useState } from "react";
import { Project } from "@/types/interfaces";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithubSquare } from '@fortawesome/free-brands-svg-icons';

interface PortfolioProps {
    projects: Project[];
}

const Portfolio: React.FC<PortfolioProps> = ({ projects }) => {
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        // Trigger fade-in when component is mounted
        const timeout = setTimeout(() => setFadeIn(true), 100);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div
            className={`portfolio transition-opacity duration-500 ${
                fadeIn ? "opacity-100" : "opacity-0"
            } text-white text-center p-3 bg-gray-600/30 bg-opacity-75 rounded-lg shadow-lg max-w-4xl mx-auto`}
        >
            <h1 className="text-2xl mb-4">Past Projects</h1>
            <ul className="list-none p-0">
                {projects.map((project) => (
                    <li key={project.id} className="mb-6 flex flex-col items-center">
                        <a
                            href={project.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-bold hover:text-sky-400/80 transition-colors duration-300 flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faGithubSquare} size="lg" className="mr-2" />
                            {project.name}
                        </a>
                        {project.description && (
                            <p className="text-sm mt-2 text-gray-300 text-center">
                                {project.description}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Portfolio;