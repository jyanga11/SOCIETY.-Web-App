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
        <div className="relative">
          <h1 className="absolute left-4 top-4 text-9xl font-arts-crafts-regular text-orange-500">
            SoCIETY.
          </h1>

          <h1 className="absolute left-2 top-2 text-9xl font-arts-crafts-regular text-pink-500">
            SoCIETY.
          </h1>

          <h1 className="relative text-9xl font-arts-crafts-regular text-purple-500">
            SoCIETY.
          </h1>
        </div>

        <section className="px-6 py-16">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="flex flex-col text-6xl">
              <span className="pl-0">
                Uplifting{" "}
                <span className="font-arts-crafts-regular text-7xl text-orange-500">
                  culture
                </span>{" "}
              </span>
              <span className="pl-48">through </span>
              <span className="pl-96">
                <span className="font-arts-crafts-regular text-7xl text-purple-800">
                  art
                </span>
                {" & "}
                <span className="font-arts-crafts-regular text-7xl text-purple-800">
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
