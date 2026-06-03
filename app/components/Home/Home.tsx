export const Home = () => {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <video
          className="h-full w-full object-contain grayscale invert"
          src="/3danimation.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <main className="relative z-10">
        <section className="flex min-h-screen w-full items-center justify-center px-6">
          <h1 className="text-9xl font-arts-crafts-regular bg-gradient-to-r from-orange-500 to-purple-800 bg-clip-text text-transparent">SoCIETY.</h1>
        </section>

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
