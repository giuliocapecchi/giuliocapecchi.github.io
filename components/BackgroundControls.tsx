import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface BackgroundControlsProps {
    velocity: number;
    onVelocityChange: (value: number) => void;
    backgroundChoice: string;
    onBackgroundChoiceChange: (value: string) => void;
}

const BackgroundControls: React.FC<BackgroundControlsProps> = ({ velocity, onVelocityChange, backgroundChoice, onBackgroundChoiceChange }) => {
    const [option, setOption] = useState(backgroundChoice);
    const [showControls, setShowControls] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [sliderValue, setSliderValue] = useState(velocity);

    useEffect(() => {
        const timeout = setTimeout(() => setFadeIn(true), 100);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        setSliderValue(velocity);
    }, [velocity]);

    const debouncedVelocityChange = useCallback(
        debounce((value: number) => {
            onVelocityChange(value);
        }, 100), // Debounce di 100ms
        [onVelocityChange]
    );

    const handleSliderInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setSliderValue(value); // Aggiorna lo stato locale per l'animazione dello slider
        debouncedVelocityChange(value); // Aggiorna il valore di velocity con debounce
    };

    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setOption(value);
        onBackgroundChoiceChange(value); // Aggiorna la scelta del background
    };

    const toggleControls = () => {
        setShowControls((prev) => !prev);
    };

    return (
        <div className={`flex flex-col items-left gap-3 rounded-xl shadow-xl z-10 transition-opacity duration-500 p-2 ${fadeIn ? 'opacity-100' : 'opacity-0'} ${showControls ? 'bg-gray-900/50' : 'bg-opacity-100'}`}>
            {/* Bottone per mostrare/nascondere i controlli */}
            <div
                onClick={toggleControls}
                className="flex items-center cursor-pointer"
            >
                {/* Arrow */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-5 h-5 transform transition-transform duration-300 ease-in-out ${showControls ? 'rotate-180' : ''} text-white`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 13.293a1 1 0 011.414 0L10 9.586l3.293 3.707a1 1 0 111.414-1.414l-4-4a1 1 0 00-1.414 0l-4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                    />
                </svg>
                <span
                    className="text-white text-sm sm:text-base transition-all duration-300 ease-in-out"
                >
                    {showControls ? 'Hide Controls' : 'Background'}
                </span>
            </div>

            {/* Bottom line */}
            <div className="h-0.5 w-full bg-gray-300 mt-0 mb-0" />

            {/* Controls container*/}
            <div
                className={`transition-all duration-500 ease-in-out ${showControls ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
            >
                {/* Contenitore per il select */}
                <div className="flex-1 mt-4">
                    <select
                        id="options"
                        value={option}
                        onChange={handleOptionChange}
                        className="text-xs sm:text-sm px-4 py-2 w-28 sm:w-32 h-10 bg-white border border-gray-300/40 rounded-xl text-gray-700 cursor-pointer shadow-md transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-blue-500 hover:ring-2 hover:ring-blue-300 focus:ring-opacity-75 truncate"
                    >
                        <option value="Neurons">Neurons</option>
                        <option value="Blizzard">Blizzard</option>
                        <option value="Field">Field</option>
                    </select>
                </div>

                {/* Slder container */}
                <div className="flex-1 mt-4">
                    <label htmlFor="velocity" className="block text-xs text-white mb-1">
                        Velocity: {sliderValue.toFixed(1)}
                    </label>
                    <input
                        type="range"
                        id="velocity"
                        min="0"
                        max="1"
                        step="0.1"
                        value={sliderValue}
                        onChange={handleSliderInputChange}
                        className="w-32 sm:w-40 h-2 bg-gradient-to-r accent-blue-900 from-sky-500 to-sky-700 rounded-full appearance-none cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 hover:ring-2 hover:ring-green-300 focus:ring-opacity-75"
                    />
                </div>
            </div>
        </div>
    );
};

export default BackgroundControls;