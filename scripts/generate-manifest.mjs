import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const dir = fileURLToPath(new URL('..', import.meta.url));
const wallpapersDir = join(dir, 'wallpapers');
const outputPath = join(dir, 'src', 'manifest.ts');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function collectCollections(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const collections = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const jsonPath = join(dir, entry.name, 'wallpaper.json');
    if (!existsSync(jsonPath)) continue;

    const config = readJson(jsonPath);

    const wallpapers = (config.wallpapers || []).map((wp) => ({
      ratio: wp.ratio,
      file: `${entry.name}/${wp.file}`,
      message: wp.message || '',
    }));

    collections.push({
      id: entry.name,
      name: config.name,
      tags: config.tags || [],
      wallpapers,
      arts: config.arts || [],
    });
  }

  return collections;
}

const collections = collectCollections(wallpapersDir);

const tsContent = `// Auto-generated. Do not edit.
import type { WallpaperCollection } from './types';

const manifest: WallpaperCollection[] = ${JSON.stringify(collections, null, 2)};

export default manifest;
`;

writeFileSync(outputPath, tsContent, 'utf-8');
console.log(`Generated manifest with ${collections.length} collection(s): ${collections.map(c => c.id).join(', ') || '(none)'}`);
