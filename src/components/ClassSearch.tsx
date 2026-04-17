import { useState, useRef, useEffect, useCallback } from 'react';
import { Class } from '../services/api';

const MAX_RESULTS = 7;

interface Props {
  classes: Class[];
  value: string;
  onChange: (val: string) => void;
  inputStyle?: React.CSSProperties;
  placeholder?: string;
}

export default function ClassSearch({ classes, value, onChange, inputStyle, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim().length === 0
    ? []
    : classes
        .filter(c => c.classId.includes(value.toLowerCase().trim()))
        .slice(0, MAX_RESULTS);

  useEffect(() => {
    setActiveIdx(-1);
    setOpen(filtered.length > 0);
  }, [value, filtered.length]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const select = useCallback((classId: string) => {
    onChange(classId.toUpperCase());
    setOpen(false);
    setActiveIdx(-1);
  }, [onChange]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      select(filtered[activeIdx].classId);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
      <input
        className="form-control form-control-lg"
        placeholder={placeholder ?? 'Search for a class...'}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => filtered.length > 0 && setOpen(true)}
        autoComplete="off"
        style={inputStyle}
      />
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: 'rgba(0, 12, 35, 0.97)',
          border: '1px solid rgba(0, 90, 200, 0.35)',
          borderRadius: '10px',
          overflow: 'hidden',
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}>
          {filtered.map((c, i) => (
            <div
              key={c.classId}
              onMouseDown={() => select(c.classId)}
              onMouseEnter={() => setActiveIdx(i)}
              style={{
                padding: '0.65rem 1rem',
                cursor: 'pointer',
                background: i === activeIdx ? 'rgba(0, 70, 180, 0.35)' : 'transparent',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(0, 90, 200, 0.12)' : 'none',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'baseline',
                transition: 'background 0.1s',
              }}
            >
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-heading)', minWidth: '5rem' }}>
                {c.classId.toUpperCase()}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {c.className}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
