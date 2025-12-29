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

export const BreathingBloom: React.FC<AlbumProps> = ({
  albumName,
  audioSrc,
  albumArtSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(staticFile(audioSrc));

  const FADE_IN_DURATION = fps * 2;
  const LOGO_APPEAR_FRAME = fps * 1;
  const TEXT_APPEAR_FRAME = fps * 2;
  const TEXT_HOLD_DURATION = fps * 6;
  const TEXT_FADE_OUT_FRAME = TEXT_APPEAR_FRAME + fps * 0.5 + TEXT_HOLD_DURATION;
  const TEXT_FADE_OUT_DURATION = fps * 2;

  // Vinyl spin: one full rotation every 8 seconds (45 RPM feel)
  const vinylRotation = (frame / fps) * (360 / 8);

  // Audio-reactive glow: extract bass frequencies for beat detection
  let audioAmplitude = 0;
  if (audioData) {
    const visualization = visualizeAudio({
      fps,
      frame,
      audioData,
      numberOfSamples: 32,
      smoothing: true,
    });
    // Average low frequencies (first 8 samples = bass range) for beat detection
    const bassRange = visualization.slice(0, 8);
    audioAmplitude = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length;
  }

  // Combine time-based pulse with audio reactivity
  const baseGlowCycle = (frame / fps) * (Math.PI / 2);
  const baseGlow = 0.2 + Math.sin(baseGlowCycle) * 0.1;
  const glowOpacity = baseGlow + audioAmplitude * 0.6;

  // Fade in animation
  const fadeInOpacity = interpolate(frame, [0, FADE_IN_DURATION], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Logo fade in
  const logoOpacity = interpolate(
    frame,
    [LOGO_APPEAR_FRAME, LOGO_APPEAR_FRAME + fps * 0.5],
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

  return (
    <AbsoluteFill style={{ backgroundColor: colors.voidBlack }}>
      {/* Layer 1: Blurred album art background */}
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

      {/* Layer 2: Animated radial purple glow */}
      <AbsoluteFill
        style={{
          opacity: fadeInOpacity * glowOpacity,
          background: `radial-gradient(circle at 50% 45%, ${colors.brandPurple}40 0%, ${colors.brandPurple}20 30%, transparent 70%)`,
        }}
      />

      {/* Layer 3: Secondary pink accent glow (bottom) */}
      <AbsoluteFill
        style={{
          opacity: fadeInOpacity * glowOpacity * 0.5,
          background: `radial-gradient(circle at 50% 80%, ${colors.brandPink}30 0%, transparent 50%)`,
        }}
      />

      {/* Layer 4: Floating light orbs */}
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

      {/* Layer 5: Vinyl album art */}
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
            width: 640,
            height: 640,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.brandPurple}60 0%, transparent 70%)`,
            filter: 'blur(50px)',
            opacity: glowOpacity * 1.8,
          }}
        />

        <Img
          src={staticFile(albumArtSrc)}
          style={{
            width: 560,
            height: 560,
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

      {/* Layer 5: Typography */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 100,
        }}
      >
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textTranslateY}px)`,
            textAlign: 'center',
          }}
        >
          {/* Album name */}
          <div
            style={{
              fontFamily: serifFont,
              fontSize: 64,
              fontWeight: 500,
              color: colors.textPrimary,
              letterSpacing: 0,
              marginBottom: 20,
              textShadow: `0 0 40px ${colors.brandPurple}60`,
            }}
          >
            {albumName}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontFamily: sansFont,
              fontSize: 20,
              fontWeight: 400,
              color: colors.textSecondary,
              letterSpacing: '0.05em',
            }}
          >
            pravos.xyz — Your all-in-one focus workspace
          </div>
        </div>
      </AbsoluteFill>

      {/* Layer 6: Pravos logo (bottom-left) */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          padding: 48,
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
              width: 180,
              height: 'auto',
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Audio */}
      <Audio src={staticFile(audioSrc)} />
    </AbsoluteFill>
  );
};
