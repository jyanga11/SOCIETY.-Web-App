import Image from "next/image";

export const Home = () => {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/Society_Logo_Earth_2.0 copy.png"
          alt="SOCIETY. Earth logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-4xl font-arts-crafts-regular">SoCIETY.</h1>
      </main>
    </div>
  );
};
