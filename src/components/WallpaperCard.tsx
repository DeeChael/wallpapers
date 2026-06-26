import type { WallpaperCollection, WallpaperEntry } from '../types';
import { wallpaperUrl } from '../wallpaperUrl';

interface WallpaperCardProps {
  collection: WallpaperCollection;
  entry: WallpaperEntry;
  onClick: () => void;
}

const ASPECT_RATIOS: Record<string, number> = {
  '16:9': 9 / 16,
  '16:10': 10 / 16,
  '4:3': 3 / 4,
  '3:2': 2 / 3,
  '10:16': 16 / 10,
  '9:16': 16 / 9,
  '9:20': 20 / 9,
};

export default function WallpaperCard({ collection, entry, onClick }: WallpaperCardProps) {
  const ratio = ASPECT_RATIOS[entry.ratio] || 9 / 16;

  return (
    <div className="wallpaper-card" onClick={onClick}>
      <div className="wallpaper-image-wrapper" style={{ paddingBottom: `${ratio * 100}%` }}>
        <img
          className="wallpaper-image"
          src={wallpaperUrl(entry.file)}
          alt={collection.name}
          loading="lazy"
        />
      </div>
      <div className="wallpaper-info">
        <h3 className="wallpaper-name">{collection.name}</h3>
        <div className="wallpaper-tags">
          {collection.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
