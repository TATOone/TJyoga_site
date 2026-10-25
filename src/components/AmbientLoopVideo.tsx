import React, { useCallback, useEffect, useRef, useState } from 'react';

type AmbientLoopVideoProps = {
  webmSrc: string;
  mp4Src: string;
  posterSrc: string;
  className?: string;
  fadeEdges?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    addEventListener?: (type: 'change', listener: () => void) => void;
    removeEventListener?: (type: 'change', listener: () => void) => void;
  };
};

type PlayPhase = 'idle' | 'playing' | 'ended' | 'blocked';

function prefersSaveData(): boolean {
  return Boolean((navigator as NavigatorWithConnection).connection?.saveData);
}

function prepareInlineMuted(video: HTMLVideoElement): void {
  // React's `muted` attribute does not always set the DOM property on iOS.
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', 'true');
}

function tapClassForPhase(phase: PlayPhase): string {
  switch (phase) {
    case 'blocked':
      return 'ambient-loop-video--tap';
    case 'idle':
    case 'playing':
    case 'ended':
      return '';
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

/**
 * Decorative play-once video: starts the first time the block is ≥50% visible,
 * then rests on the last frame. Save-Data keeps the poster. Reduced motion
 * still plays once (owner request; no loop).
 */
const AmbientLoopVideo: React.FC<AmbientLoopVideoProps> = ({
  webmSrc,
  mp4Src,
  posterSrc,
  className = '',
  fadeEdges = true,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startedRef = useRef(false);
  const playLockRef = useRef(false);
  const [posterOnly, setPosterOnly] = useState(false);
  const [phase, setPhase] = useState<PlayPhase>('idle');

  const bindVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node) {
      prepareInlineMuted(node);
    }
  }, []);

  const attemptPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || startedRef.current || playLockRef.current) {
      return;
    }

    playLockRef.current = true;
    prepareInlineMuted(video);

    try {
      await video.play();
      startedRef.current = true;
      setPhase('playing');
    } catch {
      playLockRef.current = false;
      setPhase('blocked');
    }
  }, []);

  useEffect(() => {
    const connection = (navigator as NavigatorWithConnection).connection;
    const sync = () => {
      setPosterOnly(prefersSaveData());
    };

    sync();
    connection?.addEventListener?.('change', sync);
    return () => {
      connection?.removeEventListener?.('change', sync);
    };
  }, []);

  useEffect(() => {
    if (posterOnly) {
      return;
    }

    const node = rootRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || entry.intersectionRatio < 0.5) {
          return;
        }
        void attemptPlay();
        observer.disconnect();
      },
      { root: null, threshold: [0, 0.5, 1] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [attemptPlay, posterOnly]);

  const handleEnded = () => {
    startedRef.current = true;
    setPhase('ended');
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }
    const last = Math.max(0, video.duration - 0.05);
    if (video.currentTime < last) {
      video.currentTime = last;
    }
  };

  const handleUserStart = () => {
    if (startedRef.current || posterOnly) {
      return;
    }
    void attemptPlay();
  };

  const frameClass = [
    'ambient-loop-video',
    fadeEdges ? 'ambient-loop-video--fade' : '',
    tapClassForPhase(phase),
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={rootRef}
      className={frameClass}
      aria-hidden="true"
      onClick={handleUserStart}
    >
      {posterOnly ? (
        <img
          src={posterSrc}
          alt=""
          width={960}
          height={540}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ) : (
        <video
          ref={bindVideo}
          width={960}
          height={540}
          muted
          playsInline
          preload="auto"
          poster={posterSrc}
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          onEnded={handleEnded}
        >
          <source src={mp4Src} type={'video/mp4; codecs="avc1.4D401F"'} />
          <source src={webmSrc} type={'video/webm; codecs="vp9"'} />
        </video>
      )}
    </div>
  );
};

export default AmbientLoopVideo;
