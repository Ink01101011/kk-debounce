import { useState } from 'react';
import { useThrottled } from 'kk-debounce/react';

export default function ThrottledMouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const updatePosition = useThrottled((x: number, y: number) => {
    setPosition({ x, y });
  }, 120);

  return (
    <div
      onMouseMove={(event) => updatePosition(event.clientX, event.clientY)}
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 16,
        minHeight: 120,
      }}
    >
      <p>Move your mouse inside this box.</p>
      <p>
        x: {position.x}, y: {position.y}
      </p>
    </div>
  );
}
