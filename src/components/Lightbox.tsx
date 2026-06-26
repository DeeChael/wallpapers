import { useEffect, useState, useCallback, useRef } from 'react';

interface LightboxImage {
  url: string;
  label: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex: number;
  onClose: () => void;
}

export default function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const goTo = useCallback((i: number) => {
    setIndex(i);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) goTo(index - 1);
      if (e.key === 'ArrowRight' && index < images.length - 1) goTo(index + 1);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, index, images.length, goTo]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.max(0.5, Math.min(5, s - e.deltaY * 0.002)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: position.x, posY: position.y };
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: dragRef.current.posX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.posY + (e.clientY - dragRef.current.startY),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const current = images[index];

  return (
    <div className="lightbox" onClick={onClose} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <button className="lightbox-close" onClick={onClose}>✕</button>

      {index > 0 && (
        <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); goTo(index - 1); }}>‹</button>
      )}
      {index < images.length - 1 && (
        <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); goTo(index + 1); }}>›</button>
      )}

      <div className="lightbox-counter">{index + 1} / {images.length}</div>

      <div
        className="lightbox-image-wrap"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        <img
          ref={imgRef}
          className="lightbox-image"
          src={current.url}
          alt={current.label}
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        />
      </div>
    </div>
  );
}
