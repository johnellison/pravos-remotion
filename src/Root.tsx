import { Composition } from 'remotion';
import { BreathingBloom } from './BreathingBloom';
import { BreathingBloomShort } from './BreathingBloomShort';
import { BreathingBloomStory } from './BreathingBloomStory';
import { MinimalWave } from './MinimalWave';
import { Thumbnail } from './Thumbnail';
import { albumPropsSchema, thumbnailPropsSchema } from './schema';

const ALBUM_DEFAULTS = {
  albumName: 'Cognitive Bloom',
  albumSlug: 'cognitive-bloom',
  audioSrc: '/albums/cognitive bloom-full-album.mp3',
  albumArtSrc: '/assets/albums/cognitive_bloom.webp',
};

const THUMBNAIL_DEFAULTS = {
  albumName: 'Cognitive Bloom',
  albumArtSrc: '/assets/albums/cognitive_bloom.webp',
  duration: '25 MIN',
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BreathingBloom"
        component={BreathingBloom}
        schema={albumPropsSchema}
        durationInFrames={45000}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={ALBUM_DEFAULTS}
      />
      <Composition
        id="Thumbnail"
        component={Thumbnail}
        schema={thumbnailPropsSchema}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={720}
        defaultProps={THUMBNAIL_DEFAULTS}
      />
      <Composition
        id="MinimalWave"
        component={MinimalWave}
        schema={albumPropsSchema}
        durationInFrames={45000}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={ALBUM_DEFAULTS}
      />
      <Composition
        id="BreathingBloomShort"
        component={BreathingBloomShort}
        schema={albumPropsSchema}
        durationInFrames={45000}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={ALBUM_DEFAULTS}
      />
      <Composition
        id="BreathingBloomStory"
        component={BreathingBloomStory}
        schema={albumPropsSchema}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={ALBUM_DEFAULTS}
      />
    </>
  );
};
