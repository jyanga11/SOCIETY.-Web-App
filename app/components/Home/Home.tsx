import Image from "next/image";

export const Home = () => {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-16">
      <div className="relative aspect-[5252/3723] w-full min-h-[min(60vh,800px)] max-w-6xl sm:max-w-7xl">
        <Image
          className="object-contain dark:invert"
          src="/Society_Logo_Earth_2.0 copy.png"
          alt="SOCIETY. Earth logo"
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1152px"
        />
        <h1 className="pointer-events-none absolute inset-0 flex items-center justify-center text-6xl font-arts-crafts-regular sm:text-7xl md:text-8xl">
          SoCIETY.
        </h1>
      </div>
      <div className="mt-16 w-full max-w-6xl text-4xl sm:text-5xl md:text-6xl">
          <h2 className="flex flex-col">
            <span className="pl-0">Uplifting <span className="font-arts-crafts-regular text-orange-500">culture</span> </span>
            <span className="pl-24">through </span>
            <span className="pl-48 font-arts-crafts-regular text-purple-500">art & technology.</span>
          </h2>
      </div>
    </main>
  );
};
