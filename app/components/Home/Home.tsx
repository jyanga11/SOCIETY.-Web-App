import Image from "next/image";

export const Home = () => {
  return (
    <div className="flex justify-center">
      <main>
        <div className="relative inline-block">
          <Image
            className="dark:invert"
            src="/Society_Logo_Earth_2.0 copy.png"
            alt="SOCIETY. Earth logo"
            width={600}
            height={100}
            priority
          />
          <h1 className="absolute inset-0 flex items-center justify-center text-4xl font-arts-crafts-regular pointer-events-none">
            SoCIETY.
          </h1>
        </div>
      </main>
    </div>
  );
};
