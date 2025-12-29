import { AbsoluteFill, Audio, Img, staticFile } from 'remotion';
import { AlbumProps } from './schema';

export const MinimalWave: React.FC<AlbumProps> = ({
  albumName,
  audioSrc,
  albumArtSrc,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0F' }}>
      {/* Background album art (blurred) */}
      <AbsoluteFill
        style={{
          opacity: 0.3,
          filter: 'blur(40px)',
        }}
      >
        <Img
          src={staticFile(albumArtSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </AbsoluteFill>

      {/* Album art (center) */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Img
          src={staticFile(albumArtSrc)}
          style={{
            width: 400,
            height: 400,
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        />
      </AbsoluteFill>

      {/* Text overlay */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 48,
            fontWeight: 700,
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          {albumName}
        </div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 24,
            color: '#8B6FCB',
            marginTop: 16,
          }}
        >
          pravos.xyz
        </div>
      </AbsoluteFill>

      {/* Audio */}
      <Audio src={staticFile(audioSrc)} />
    </AbsoluteFill>
  );
};
