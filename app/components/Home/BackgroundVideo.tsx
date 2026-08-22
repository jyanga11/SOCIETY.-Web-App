'use client';

export const BackgroundVideo = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <video
        className="h-full w-full object-contain grayscale dark:invert-0 light:invert"
        src="/3danimation.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
};