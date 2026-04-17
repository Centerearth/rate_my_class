import { useState } from 'react';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: string;
}

export default function StarRating({ value, onChange, readOnly = false, size = '1.75rem' }: Props) {
  const [hovered, setHovered] = useState(0);
  const display = readOnly ? value : (hovered || value);

  return (
    <div style={{ display: 'flex', gap: '0.2rem' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const full = star <= display;
        const half = !full && star - 0.5 <= display;
        return (
          <span key={star} style={{ position: 'relative', display: 'inline-block', fontSize: size, userSelect: 'none' }}>
            <span style={{ color: 'rgba(160, 195, 230, 0.2)' }}>★</span>
            {(full || half) && (
              <span style={{ position: 'absolute', left: 0, top: 0, width: full ? '100%' : '50%', overflow: 'hidden', color: '#f5c518' }}>★</span>
            )}
            {!readOnly && (
              <>
                <span
                  style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(star - 0.5)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => onChange?.(star - 0.5)}
                />
                <span
                  style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => onChange?.(star)}
                />
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}
