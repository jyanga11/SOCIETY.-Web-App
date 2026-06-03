import Image from "next/image";

export const Home = () => {
  return (
    <div className="items-center justify-items-center">
      <main className="items-center">
        <Image
          className="dark:invert"
          src="/Society_Logo_Earth_2.0 copy.png"
          alt="SOCIETY. Earth logo"
          width={600}
          height={100}
          priority
        />
        <h1 className="text-4xl font-arts-crafts-regular">SoCIETY.</h1>
      </main>
    </div>
  );
};
