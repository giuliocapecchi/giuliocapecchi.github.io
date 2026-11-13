import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders, faXmark } from '@fortawesome/free-solid-svg-icons';

interface BackgroundControlsProps {
    velocity: number;
    onVelocityChange: (value: number) => void;
    backgroundChoice: string;
    onBackgroundChoiceChange: (value: string) => void;
}

export default function BackgroundControls({ velocity, onVelocityChange, backgroundChoice, onBackgroundChoiceChange }: BackgroundControlsProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`controls-shell flex flex-col ${open ? 'controls-shell--open' : ''}`}
            onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); event.currentTarget.querySelector('button')?.focus(); } }}>
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="scene-controls"
                aria-label={open ? 'Hide background controls' : 'Show background controls'} className="controls-toggle group">
                <FontAwesomeIcon icon={open ? faXmark : faSliders} className="w-3.5 h-3.5 text-white/80" />
                <span className="text-white/80 text-xs tracking-wide uppercase">{open ? 'Close' : 'Scene'}</span>
            </button>
            {open && <div id="scene-controls" className="controls-inner">
                <div>
                    <label htmlFor="background" className="block text-xs text-white/70 mb-2">Background</label>
                    <select id="background" className="glass-select" value={backgroundChoice} onChange={event => onBackgroundChoiceChange(event.target.value)}>
                        <option value="Still">Still · no motion</option>
                        <option value="Lair">Lair</option>
                        <option value="Neurons">Neurons</option>
                        <option value="Blizzard">Blizzard</option>
                    </select>
                </div>
                {backgroundChoice !== 'Still' && <div>
                    <div className="flex justify-between mb-3">
                        <label htmlFor="velocity" className="text-xs text-white/70">Speed</label>
                        <span className="text-xs text-white/80 tabular-nums">{velocity.toFixed(1)}</span>
                    </div>
                    <input type="range" id="velocity" min="0" max="1" step="0.1" value={velocity}
                        onChange={event => onVelocityChange(Number(event.target.value))} className="glass-slider w-full" />
                </div>}
            </div>}
        </div>
    );
}
