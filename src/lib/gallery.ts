export type GalleryPhoto = {
  id: number;
  alt: string;
  src: string;
};

export type GalleryProject = {
  id: number;
  title: string;
  tag: string;
  body: string;
  hidden?: boolean;
  photos: GalleryPhoto[];
};
