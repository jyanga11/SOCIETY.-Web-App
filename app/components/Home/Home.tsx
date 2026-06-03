export const Home = () => {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-16">
      <div className="relative aspect-[5252/3723] w-full max-w-xl m-24">
        <video
          className="object-contain dark:invert"
          src="/3danimation.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <h1 className="absolute inset-0 flex items-center justify-center text-8xl font-arts-crafts-regular">
          SoCIETY.
        </h1>
      </div>
      <div className="mt-48 w-full max-w-6xl">
          <h2 className="flex flex-col text-6xl">
            <span className="pl-0">Uplifting <span className="font-arts-crafts-regular text-orange-500 text-7xl">culture</span> </span>
            <span className="pl-48">through </span>
            <span className="pl-96">
              <span className="font-arts-crafts-regular text-purple-500 text-7xl">art</span>
              {" & "}
              <span className="font-arts-crafts-regular text-purple-500 text-7xl">technology</span>
              {"."}
            </span>
          </h2>
      </div>
    </main>
  );
};
