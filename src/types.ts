export interface WallpaperEntry {
  ratio: string;
  file: string;
  message: string;
}

export interface ArtCredit {
  url: string;
  title: string;
  author: string;
}

export interface WallpaperCollection {
  id: string;
  name: string;
  tags: string[];
  wallpapers: WallpaperEntry[];
  arts: ArtCredit[];
}
