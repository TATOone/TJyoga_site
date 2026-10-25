import React, { useEffect, useRef, useState } from 'react';

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
  };
};

function prefersSaveData(): boolean {
  return Boolean((navigator as NavigatorWithConnection).connection?.saveData);
}

function prefersStaticAmbient(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches || prefersSaveData();
}

/**
 * Decorative looping video: poster first, sources only in view,
 * pause off-screen, static poster for reduced motion and Save-Data.
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
  const [staticOnly, setStaticOnly] = useState(true);
  const [sourcesArmed, setSourcesArmed] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setStaticOnly(prefersStaticAmbient());
    };

    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (staticOnly) {
      setSourcesArmed(false);
      setInView(false);
      return;
    }

    const node = rootRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setInView(visible);
        if (visible) {
          setSourcesArmed(true);
        }
      },
      { root: null, rootMargin: '120px 0px', threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [staticOnly]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sourcesArmed || staticOnly) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.load();
  }, [mp4Src, sourcesArmed, staticOnly, webmSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sourcesArmed || staticOnly) {
      return;
    }

    if (inView) {
      void video.play().catch(() => undefined);
      return;
    }

    video.pause();
  }, [inView, sourcesArmed, staticOnly]);

  const frameClass = [
    'ambient-loop-video',
    fadeEdges ? 'ambient-loop-video--fade' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={rootRef} className={frameClass} aria-hidden="true">
      {staticOnly ? (
        <img
          src={posterSrc}
          alt=""
          width={960}
          height={540}
          decoding="async"
          draggable={false}
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={posterSrc}
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
        >
          {sourcesArmed ? (
            <>
              <source src={webmSrc} type="video/webm" />
              <source src={mp4Src} type="video/mp4" />
            </>
          ) : null}
        </video>
      )}
    </div>
  );
};

export default AmbientLoopVideo;
