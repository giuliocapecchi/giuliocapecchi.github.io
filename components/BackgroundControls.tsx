import React, { useState, useEffect, useMemo } from 'react';
import CustomSelect from './CustomSelect';
import debounce from 'lodash/debounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders, faXmark } from '@fortawesome/free-solid-svg-icons';

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

    const debouncedVelocityChange = useMemo(
        () => debounce((value: number) => onVelocityChange(value), 100),
        [onVelocityChange]
    );

    useEffect(() => {
        return () => {
            debouncedVelocityChange.cancel();
        };
    }, [debouncedVelocityChange]);

    const handleSliderInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setSliderValue(value);
        debouncedVelocityChange(value);
    };


    const toggleControls = () => {
        setShowControls((prev) => !prev);
    };

    return (
        <div className={`controls-shell flex flex-col z-10 transition-all duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'} ${showControls ? 'controls-shell--open' : ''}`}>
            <button
                type="button"
                onClick={toggleControls}
                aria-expanded={showControls}
                aria-label={showControls ? 'Hide background controls' : 'Show background controls'}
                className="controls-toggle group"
            >
                <FontAwesomeIcon
                    icon={showControls ? faXmark : faSliders}
                    className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors"
                />
                <span className="text-white/80 group-hover:text-white text-xs tracking-wide uppercase transition-colors">
                    {showControls ? 'Close' : 'Scene'}
                </span>
            </button>

            <div
                className={`controls-panel ${showControls ? 'controls-panel--open' : ''}`}
            >
                <div className="controls-inner">
                    <div>
                        <span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Background</span>
                        <CustomSelect
                            id="options"
                            options={[{ value: 'Neurons' }, { value: 'Blizzard' }, { value: 'Lair' }]}
                            value={option}
                            onChange={(v) => { setOption(v); onBackgroundChoiceChange(v); }}
                        />
                    </div>

                    <div>
                        <div className="flex items-baseline justify-between mb-1.5">
                            <label htmlFor="velocity" className="text-[10px] uppercase tracking-widest text-white/40">Velocity</label>
                            <span className="text-xs text-white/80 tabular-nums font-medium">{sliderValue.toFixed(1)}</span>
                        </div>
                        <input
                            type="range"
                            id="velocity"
                            min="0"
                            max="1"
                            step="0.1"
                            value={sliderValue}
                            onChange={handleSliderInputChange}
                            className="glass-slider w-32 sm:w-40"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackgroundControls;