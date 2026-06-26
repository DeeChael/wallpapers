import { useMemo, type ReactNode } from 'react';

interface MasonryProps {
  children: ReactNode[];
  columnCount?: number;
}

export default function Masonry({ children, columnCount = 4 }: MasonryProps) {
  const columns = useMemo(() => {
    const cols: ReactNode[][] = Array.from({ length: columnCount }, () => []);
    children.forEach((child, i) => cols[i % columnCount].push(child));
    return cols;
  }, [children, columnCount]);

  return (
    <div className="masonry" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {columns.map((col, i) => (
        <div key={i} className="masonry-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {col}
        </div>
      ))}
    </div>
  );
}
