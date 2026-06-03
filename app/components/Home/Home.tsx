import Image from "next/image";

export const Home = () => {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-16">
      <div className="relative aspect-[5252/3723] w-full max-w-xl m16">
        <Image
          className="object-contain dark:invert"
          src="/Society_Logo_Earth_2.0 copy.png"
          alt="SOCIETY. Earth logo"
          fill
          priority
        />
        <h1 className="absolute inset-0 flex items-center justify-center text-8xl font-arts-crafts-regular">
          SoCIETY.
        </h1>
      </div>
      <div className="mt-48 w-full max-w-6xl text-center">
          <h2 className="flex flex-col text-6xl">
            <span className="pl-0">Uplifting <span className="font-arts-crafts-regular text-orange-500">culture</span> </span>
            <span className="pl-8">through </span>
            <span className="pl-96 font-arts-crafts-regular text-purple-500">art & technology.</span>
          </h2>
      </div>
    </main>
  );
};
