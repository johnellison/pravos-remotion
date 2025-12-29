import { z } from 'zod';

export const albumPropsSchema = z.object({
  albumName: z.string(),
  albumSlug: z.string(),
  audioSrc: z.string(),
  albumArtSrc: z.string(),
});

export const thumbnailPropsSchema = z.object({
  albumName: z.string(),
  albumArtSrc: z.string(),
  duration: z.string().optional(),
});

export type AlbumProps = z.infer<typeof albumPropsSchema>;
export type ThumbnailProps = z.infer<typeof thumbnailPropsSchema>;
