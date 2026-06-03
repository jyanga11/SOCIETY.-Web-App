import Image from "next/image";

export const Home = () => {
  return (
    <div className="flex justify-center">
      <main>
      <div className="relative m-24 w-full max-w-8xl aspect-[6/1]">
          <Image
            className="dark:invert object-contain"
            src="/Society_Logo_Earth_2.0 copy.png"
            alt="SOCIETY. Earth logo"
            fill
            priority
          />
          <h1 className="absolute inset-0 flex items-center justify-center text-8xl font-arts-crafts-regular">
            SoCIETY.
          </h1>
        </div>
        <div className="text-6xl m-24">
          <h2 className="flex flex-col">
            <span className="pl-0">Uplifting <span className="font-arts-crafts-regular text-orange-500">culture</span> </span>
            <span className="pl-24">through </span>
            <span className="pl-48 font-arts-crafts-regular text-purple-500">art & technology.</span>
          </h2>
        </div>
      </main>
    </div>
  );
};
