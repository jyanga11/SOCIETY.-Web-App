export const Home = () => {
  return (
    <>
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
        />
      </div>

      <main className="relative z-10">
        <section className="flex min-h-screen items-start justify-center pt-20vh">
          <div className="relative">
            <h1 className="absolute left-2 top-2 text-6xl sm:text-8xl md:text-9xl font-arts-crafts-regular text-orange-500">
              SoCIETY.
            </h1>

            <h1 className="relative text-6xl sm:text-8xl md:text-9xl font-arts-crafts-regular text-purple-700">
              SoCIETY.
            </h1>
          </div>
        </section>

        <section className="px-3 py-8 md:px-6 md:py-16">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="flex flex-col text-xl sm:text-5xl md:text-6xl">
              <span className="pl-0">
                Uplifting{" "}
                <span className="font-arts-crafts-regular text-2xl sm:text-6xl md:text-7xl text-orange-500">
                  culture
                </span>{" "}
              </span>
              <span className="pl-24 md:pl-48">through </span>
              <span className="pl-48 md:pl-96">
                <span className="font-arts-crafts-regular text-2xl sm:text-6xl md:text-7xl text-purple-700">
                  art
                </span>
                {" & "}
                <span className="font-arts-crafts-regular text-2xl sm:text-6xl md:text-7xl text-purple-700">
                  technology
                </span>
                {"."}
              </span>
            </h2>
          </div>
        </section>
      </main>
    </>
  );
};
