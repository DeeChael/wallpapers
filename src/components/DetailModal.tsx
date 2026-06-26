import { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import type { WallpaperCollection } from '../types';
import { wallpaperUrl } from '../wallpaperUrl';
import Masonry from './Masonry';
import Lightbox from './Lightbox';

interface DetailModalProps {
  collection: WallpaperCollection;
  onClose: () => void;
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

const ASPECT_LABELS: Record<string, string> = {
  '16:9': '16:9',
  '16:10': '16:10',
  '4:3': '4:3',
  '3:2': '3:2',
  '10:16': '10:16（竖屏）',
  '9:16': '9:16（竖屏）',
  '9:20': '9:20（竖屏）',
};

export default function DetailModal({ collection, onClose }: DetailModalProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const downloadAll = useCallback(async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      for (const wp of collection.wallpapers) {
        const url = wallpaperUrl(wp.file);
        const resp = await fetch(url);
        const blob = await resp.blob();
        const name = wp.file.split('/').pop()!;
        zip.file(name, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection.name}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [collection]);

  const images = collection.wallpapers.map((wp) => ({
    url: wallpaperUrl(wp.file),
    label: `${collection.name} ${ASPECT_LABELS[wp.ratio] || wp.ratio}`,
  }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2 className="modal-title">{collection.name}</h2>
          <div className="modal-tags">
            {collection.tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          <button className="download-all-btn" onClick={downloadAll} disabled={downloading}>
            {downloading ? '打包中...' : '下载全部'}
          </button>
        </div>

        <div className="modal-wallpapers">
          <Masonry columnCount={2}>
            {collection.wallpapers.map((wp, i) => {
              const ratio = ASPECT_RATIOS[wp.ratio] || 9 / 16;
              return (
                <div key={wp.ratio} className="modal-wallpaper-card">
                  <div
                    className="modal-wallpaper-image-wrap"
                    style={{ paddingBottom: `${ratio * 100}%` }}
                    onClick={() => setLightboxIndex(i)}
                  >
                    <img
                      className="modal-wallpaper-image"
                      src={wallpaperUrl(wp.file)}
                      alt={`${collection.name} ${wp.ratio}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="modal-wallpaper-info">
                    <span className="modal-wallpaper-label">{ASPECT_LABELS[wp.ratio] || wp.ratio}</span>
                    {wp.message && <span className="modal-wallpaper-message">{wp.message}</span>}
                    <a
                      className="modal-wallpaper-download"
                      href={wallpaperUrl(wp.file)}
                      download
                    >
                      下载
                    </a>
                  </div>
                </div>
              );
            })}
          </Masonry>
        </div>

        {collection.arts.length > 0 && (
          <div className="modal-arts">
            <h3>原图信息</h3>
            {collection.arts.map((art, i) => (
              <div key={i} className="art-item">
                <a href={art.url} target="_blank" rel="noopener noreferrer">
                  {art.title || '查看原图'}
                </a>
                {art.author && <span className="art-author"> — {art.author}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
