import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { loadFont as loadSourceSerif } from '@remotion/google-fonts/SourceSerif4';
import { loadFont as loadSourceSans } from '@remotion/google-fonts/SourceSans3';
import { AlbumProps } from './schema';

const { fontFamily: serifFont } = loadSourceSerif('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const { fontFamily: sansFont } = loadSourceSans('normal', {
  weights: ['400', '600'],
  subsets: ['latin'],
});

const colors = {
  voidBlack: '#0b0a10',
  brandPurple: '#8b6fcb',
  brandPurpleMid: '#9d7fd6',
  brandPink: '#c98aa6',
  textPrimary: '#f4f2ff',
  textSecondary: '#b2afc7',
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const LIGHT_ORBS = Array.from({ length: 12 }, (_, i) => ({
  x: seededRandom(i * 1) * 100,
  y: seededRandom(i * 2) * 100,
  size: 4 + seededRandom(i * 3) * 8,
  speed: 0.3 + seededRandom(i * 4) * 0.4,
  phase: seededRandom(i * 5) * Math.PI * 2,
  opacity: 0.03 + seededRandom(i * 6) * 0.05,
}));

export const BreathingBloomStory: React.FC<AlbumProps> = ({
  albumName,
  audioSrc,
  albumArtSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(staticFile(audioSrc));

  const FADE_IN_DURATION = fps * 0.5;
  const LOGO_APPEAR_FRAME = fps * 0.5;
  const TEXT_APPEAR_FRAME = fps * 0.5;
  const TEXT_HOLD_DURATION = fps * 6;
  const TEXT_FADE_OUT_FRAME = TEXT_APPEAR_FRAME + fps * 0.5 + TEXT_HOLD_DURATION;
  const TEXT_FADE_OUT_DURATION = fps * 2;
  const CTA_APPEAR_FRAME = fps * 14;
  const AUDIO_FADE_OUT_START = fps * 28;
  const AUDIO_FADE_OUT_DURATION = fps * 2;

  const vinylRotation = (frame / fps) * (360 / 8);

  let audioAmplitude = 0;
  if (audioData) {
    const visualization = visualizeAudio({
      fps,
      frame,
      audioData,
      numberOfSamples: 32,
      smoothing: true,
    });
    const bassRange = visualization.slice(0, 8);
    audioAmplitude = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length;
  }

  const baseGlowCycle = (frame / fps) * (Math.PI / 2);
  const baseGlow = 0.2 + Math.sin(baseGlowCycle) * 0.1;
  const glowOpacity = baseGlow + audioAmplitude * 0.6;

  const fadeInOpacity = interpolate(frame, [0, FADE_IN_DURATION], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const logoOpacity = interpolate(
    frame,
    [LOGO_APPEAR_FRAME, LOGO_APPEAR_FRAME + fps * 0.3],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const textFadeIn = interpolate(
    frame,
    [TEXT_APPEAR_FRAME, TEXT_APPEAR_FRAME + fps * 0.5],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const textFadeOut = interpolate(
    frame,
    [TEXT_FADE_OUT_FRAME, TEXT_FADE_OUT_FRAME + TEXT_FADE_OUT_DURATION],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const textOpacity = textFadeIn * textFadeOut;

  const textTranslateY = interpolate(
    frame,
    [TEXT_APPEAR_FRAME, TEXT_APPEAR_FRAME + fps * 0.5],
    [10, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const ctaOpacity = interpolate(
    frame,
    [CTA_APPEAR_FRAME, CTA_APPEAR_FRAME + fps * 0.4],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const ctaScale = interpolate(
    frame,
    [CTA_APPEAR_FRAME, CTA_APPEAR_FRAME + fps * 0.4],
    [0.95, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const audioVolume = interpolate(
    frame,
    [AUDIO_FADE_OUT_START, AUDIO_FADE_OUT_START + AUDIO_FADE_OUT_DURATION],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.voidBlack }}>
      <AbsoluteFill
        style={{
          opacity: fadeInOpacity * 0.25,
          filter: 'blur(60px) saturate(1.2)',
        }}
      >
        <Img
          src={staticFile(albumArtSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scale(1.1)',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          opacity: fadeInOpacity * glowOpacity,
          background: `radial-gradient(circle at 50% 45%, ${colors.brandPurple}40 0%, ${colors.brandPurple}20 30%, transparent 70%)`,
        }}
      />

      <AbsoluteFill
        style={{
          opacity: fadeInOpacity * glowOpacity * 0.5,
          background: `radial-gradient(circle at 50% 80%, ${colors.brandPink}30 0%, transparent 50%)`,
        }}
      />

      <AbsoluteFill style={{ opacity: fadeInOpacity }}>
        {LIGHT_ORBS.map((orb, i) => {
          const orbY = orb.y + Math.sin((frame / fps) * orb.speed + orb.phase) * 3;
          const orbOpacity = orb.opacity + Math.sin((frame / fps) * 0.5 + orb.phase) * 0.02;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${orb.x}%`,
                top: `${orbY}%`,
                width: orb.size,
                height: orb.size,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${colors.brandPurple} 0%, transparent 70%)`,
                opacity: orbOpacity,
                filter: 'blur(2px)',
              }}
            />
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: fadeInOpacity,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.brandPurple}60 0%, transparent 70%)`,
            filter: 'blur(50px)',
            opacity: glowOpacity * 1.8,
          }}
        />

        <Img
          src={staticFile(albumArtSrc)}
          style={{
            width: 420,
            height: 420,
            borderRadius: '50%',
            boxShadow: `
              0 0 100px ${colors.brandPurple}50,
              0 0 60px rgba(0, 0, 0, 0.6),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1)
            `,
            transform: `rotate(${vinylRotation}deg)`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 570,
        }}
      >
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textTranslateY}px)`,
            textAlign: 'center',
            maxWidth: '90%',
          }}
        >
          <div
            style={{
              fontFamily: serifFont,
              fontSize: 56,
              fontWeight: 500,
              color: colors.textPrimary,
              letterSpacing: 0,
              marginBottom: 16,
              textShadow: `0 0 40px ${colors.brandPurple}60`,
            }}
          >
            {albumName}
          </div>

          <div
            style={{
              fontFamily: sansFont,
              fontSize: 20,
              fontWeight: 400,
              color: colors.textSecondary,
              letterSpacing: '0.05em',
            }}
          >
            Focus Music Album
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 440,
        }}
      >
        <div
          style={{
            opacity: logoOpacity,
            filter: `drop-shadow(0 0 20px ${colors.brandPurple}40)`,
          }}
        >
          <Img
            src={staticFile('/assets/branding/Pravos_Lockup_Horizontal_Dark_Glow--no-bg.png')}
            style={{
              width: 300,
              height: 'auto',
            }}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 280,
        }}
      >
        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: sansFont,
              fontSize: 24,
              fontWeight: 600,
              color: colors.textPrimary,
              letterSpacing: '0.02em',
              textShadow: `0 0 30px ${colors.brandPurple}80`,
              padding: '16px 32px',
              background: `${colors.brandPurple}20`,
              borderRadius: 10,
              border: `1px solid ${colors.brandPurple}40`,
            }}
          >
            Full album at pravos.xyz
          </div>
        </div>
      </AbsoluteFill>

      <Audio src={staticFile(audioSrc)} volume={audioVolume} />
    </AbsoluteFill>
  );
};
