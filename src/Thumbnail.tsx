import { AbsoluteFill, Img, staticFile } from 'remotion';
import { loadFont as loadSourceSerif } from '@remotion/google-fonts/SourceSerif4';
import { loadFont as loadSourceSans } from '@remotion/google-fonts/SourceSans3';
import { ThumbnailProps } from './schema';

const { fontFamily: serifFont } = loadSourceSerif('normal', {
  weights: ['500', '600'],
  subsets: ['latin'],
});

const { fontFamily: sansFont } = loadSourceSans('normal', {
  weights: ['600'],
  subsets: ['latin'],
});

const colors = {
  voidBlack: '#0b0a10',
  brandPurple: '#8b6fcb',
  brandPink: '#c98aa6',
  textPrimary: '#f4f2ff',
  textSecondary: '#b2afc7',
};

export const Thumbnail: React.FC<ThumbnailProps> = ({
  albumName,
  albumArtSrc,
  duration = '25 MIN',
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.voidBlack }}>
      {/* Blurred background */}
      <AbsoluteFill
        style={{
          opacity: 0.3,
          filter: 'blur(80px) saturate(1.3)',
        }}
      >
        <Img
          src={staticFile(albumArtSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scale(1.2)',
          }}
        />
      </AbsoluteFill>

      {/* Purple glow center */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 35% 50%, ${colors.brandPurple}50 0%, transparent 50%)`,
          opacity: 0.4,
        }}
      />

      {/* Pink accent glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 80% 70%, ${colors.brandPink}40 0%, transparent 40%)`,
          opacity: 0.3,
        }}
      />

      {/* Main content container */}
      <AbsoluteFill
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: '60px 80px',
          gap: 60,
        }}
      >
        {/* Album art (left side) */}
        <div style={{ position: 'relative', display: 'flex' }}>
          <div
            style={{
              position: 'absolute',
              width: 420,
              height: 420,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.brandPurple}60 0%, transparent 70%)`,
              filter: 'blur(40px)',
              top: 30,
              left: 30,
            }}
          />
          <Img
            src={staticFile(albumArtSrc)}
            style={{
              width: 480,
              height: 480,
              borderRadius: '50%',
              boxShadow: `0 0 80px ${colors.brandPurple}50, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          />
        </div>

        {/* Text content (right side) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 20,
          }}
        >
          {/* Duration badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                backgroundColor: `${colors.brandPurple}30`,
                border: `1px solid ${colors.brandPurple}60`,
                borderRadius: 8,
                padding: '8px 16px',
                fontFamily: sansFont,
                fontSize: 18,
                fontWeight: 600,
                color: colors.brandPurple,
                letterSpacing: '0.1em',
              }}
            >
              {duration} FOCUS
            </div>
          </div>

          {/* Album name */}
          <div
            style={{
              fontFamily: serifFont,
              fontSize: 72,
              fontWeight: 500,
              color: colors.textPrimary,
              lineHeight: 1.1,
              textShadow: `0 0 60px ${colors.brandPurple}80`,
            }}
          >
            {albumName}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontFamily: sansFont,
              fontSize: 24,
              fontWeight: 600,
              color: colors.textSecondary,
              letterSpacing: '0.05em',
            }}
          >
            Deep Work Music
          </div>

          {/* Pravos branding */}
          <div style={{ marginTop: 20 }}>
            <Img
              src={staticFile('/assets/branding/Pravos_Lockup_Horizontal_Dark_Glow--no-bg.png')}
              style={{
                width: 160,
                height: 'auto',
                opacity: 0.9,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
