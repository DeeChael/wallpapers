import { useState, useMemo, useEffect, useCallback } from 'react';
import manifest from './manifest';
import type { WallpaperCollection } from './types';
import Masonry from './components/Masonry';
import WallpaperCard from './components/WallpaperCard';
import SearchBar from './components/SearchBar';
import DetailModal from './components/DetailModal';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getColumnCount(width: number): number {
  if (width < 640) return 1;
  if (width < 900) return 2;
  if (width < 1200) return 3;
  return 4;
}

function getBestEntry(collection: WallpaperCollection) {
  const preferred = ['16:9', '16:10', '4:3', '3:2'];
  for (const r of preferred) {
    const found = collection.wallpapers.find((w) => w.ratio === r);
    if (found) return found;
  }
  return collection.wallpapers[0];
}

export default function App() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<WallpaperCollection | null>(null);
  const [columns, setColumns] = useState(() => getColumnCount(window.innerWidth));

  useEffect(() => {
    const onResize = () => setColumns(getColumnCount(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return shuffle(manifest);
    const q = search.toLowerCase();
    return shuffle(
      manifest.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      )
    );
  }, [search]);

  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <>
      <header className="header">
        <h1 className="site-title">Wallpapers</h1>
        <SearchBar value={search} onChange={setSearch} />
      </header>

      <main className="main">
        {filtered.length === 0 ? (
          <div className="empty">没有找到匹配的壁纸</div>
        ) : (
          <Masonry columnCount={columns}>
            {filtered.map((c) => (
              <WallpaperCard
                key={c.id}
                collection={c}
                entry={getBestEntry(c)}
                onClick={() => setSelected(c)}
              />
            ))}
          </Masonry>
        )}
      </main>

      {selected && (
        <DetailModal collection={selected} onClose={handleClose} />
      )}
    </>
  );
}
