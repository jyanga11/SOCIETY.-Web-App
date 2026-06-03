import Image from "next/image";

export const Home = () => {
  return (
    <div className="flex justify-center">
      <main>
        <div className="relative inline-block m-24">
          <Image
            className="dark:invert"
            src="/Society_Logo_Earth_2.0 copy.png"
            alt="SOCIETY. Earth logo"
            width={600}
            height={100}
            priority
          />
          <h1 className="absolute inset-0 flex items-center justify-center text-10xl font-arts-crafts-regular pointer-events-none">
            SoCIETY.
          </h1>
        </div>
        <div className="text-8xl m-48">
          <h2 className="flex flex-col">
            <span className="pl-0">Uplifting <span className="font-arts-crafts-regular color-orange">culture</span> </span>
            <span className="pl-24">through </span>
            <span className="pl-48 font-arts-crafts-regular color-purple">art & technology.</span>
          </h2>
        </div>
      </main>
    </div>
  );
};
