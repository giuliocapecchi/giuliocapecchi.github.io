import React, { useEffect, useRef, useState } from 'react';

interface CustomSelectProps {
  options: Array<{ value: string; label?: string }> | string[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

const normalizeOptions = (opts?: string[] | Array<{ value: string; label?: string }>) => {
  if (!opts) return [];
  if (Array.isArray(opts) && typeof opts[0] === 'string') {
    return (opts as string[]).map((v) => ({ value: v, label: v }));
  }
  return opts as { value: string; label?: string }[];
};

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, id }) => {
  const opts = normalizeOptions(options);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(() => Math.max(0, opts.findIndex(o => o.value === value)));
  const [dropUp, setDropUp] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHighlighted(Math.max(0, opts.findIndex(o => o.value === value)));
  }, [value, options, opts]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    // compute dropdown direction and maxHeight
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // prefer below, but if not enough space and above is larger, drop up
      const preferredHeight = 240; // default desired height
      if (spaceBelow < Math.min(120, preferredHeight) && spaceAbove > spaceBelow) {
        setDropUp(true);
        setMaxHeight(Math.max(80, Math.min(spaceAbove - 20, preferredHeight)));
      } else {
        setDropUp(false);
        setMaxHeight(Math.max(80, Math.min(spaceBelow - 20, preferredHeight)));
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return setOpen(false);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted((h) => Math.min(opts.length - 1, h + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted((h) => Math.max(0, h - 1));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const opt = opts[highlighted];
        if (opt) {
          onChange(opt.value);
          setOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, highlighted, opts, onChange]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        className="glass-select"
      >
        <span className="truncate">{opts.find(o => o.value === value)?.label ?? value}</span>
        <svg className="ml-2 w-4 h-4 text-white inline-block" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-activedescendant={opts[highlighted]?.value}
          tabIndex={-1}
          className={`glass-dropdown-list mt-2 py-1 z-50 ${dropUp ? 'drop-up' : ''}`}
          style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined, overflowY: 'auto' }}
        >
          {opts.map((opt, i) => (
            <li
              key={opt.value}
              id={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`glass-dropdown-item ${i === highlighted ? 'bg-white/5' : ''}`}
            >
              {opt.label ?? opt.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
