import { WordRotater } from "../WordRotater";
import { International } from "../International"
import { PHRASES } from '../../constants/phrases';
import MediaRow from "../MediaRow";
import Link from "next/link";

const dummyMovies = [
  { id: 1, title: 'Stranger Things', image: 'https://placehold.co/600x400/111/fff?text=Stranger+Things' },
  { id: 2, title: 'The Witcher', image: 'https://placehold.co/600x400/222/fff?text=The+Witcher' },
  { id: 3, title: 'Ozark', image: 'https://placehold.co/600x400/333/fff?text=Ozark' },
  { id: 4, title: 'Wednesday', image: 'https://placehold.co/600x400/444/fff?text=Wednesday' },
  { id: 5, title: 'The Crown', image: 'https://placehold.co/600x400/555/fff?text=The+Crown' },
  { id: 6, title: 'Mindhunter', image: 'https://placehold.co/600x400/666/fff?text=Mindhunter' },
  { id: 7, title: 'Black Mirror', image: 'https://placehold.co/600x400/777/fff?text=Black+Mirror' },
];

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
        <section className="flex min-h-screen pt-[30vh] sm:pt-[40vh] md:pt-[40vh] justify-center">
          <div className="relative">
            <h1 className="absolute left-1 top-1 md:left-2 md:top-2 text-6xl sm:text-8xl md:text-9xl font-arts-crafts-regular text-orange-500">
              SoCIETY.
            </h1>

            <h1 className="relative text-6xl sm:text-8xl md:text-9xl font-arts-crafts-regular text-purple-700">
              SoCIETY.
            </h1>
          </div>
        </section>

        <section className="sm:min-h-[30vh] min-h-[15vh] px-3 sm:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="flex flex-col text-3xl sm:text-6xl">
              <span className="pl-0">
                Uplifting{" "}
                <span className="font-arts-crafts-regular text-4xl sm:text-7xl text-orange-500">
                  culture
                </span>{" "}
              </span>
              <span className="pl-12 sm:pl-48">through </span>
              <span className="pl-24 sm:pl-96">
                <span className="font-arts-crafts-regular text-4xl sm:text-7xl text-purple-700">
                  art
                </span>
                {" & "}
                <span className="font-arts-crafts-regular text-4xl sm:text-7xl text-purple-700">
                  tech
                </span>
                {"."}
              </span>
            </h2>
          </div>
        </section>

        <section className="flex flex-col gap-6 sm:flex-row w-full sm:px-20 px-7 py-30">
          
          <Link href="/services">
            <div className="sm:px-20">
              <h3 className="text-2xl sm:text-3xl font-arts-crafts-regular">
                Skills
              </h3>
              <ul className="text-4xl sm:text-6xl">
                <li>Brand Identity</li>
                <li>Creative Direction</li>
                <li>Content Strategy</li>
                <li>Web Design</li>
                <li>E-Commerce</li>
                <li>Videography</li>
                <li>Audio Mixing</li>
              </ul>
            </div>
          </Link>

          <Link href="/about">
            <div className="w-full sm:max-w-[40vw]">
              <p className="text-xl sm:text-4xl">
                <span className="font-arts-crafts-regular">SoCIETY.</span> is a <WordRotater phrases={PHRASES} /><br></br>
                built from the ground up for and by those that never had a blueprint but always had a vision. Our mission is to equip traditionally under-represented creatives with the tools, knowledge, platform, and support to transform their raw ideas into cultural movements that reject the status quo.
              </p>
            </div>
          </Link>

        </section>

        <International />

        <MediaRow title="Projects" items={dummyMovies} variant="landscape"/>
        <MediaRow title="Shop" items={dummyMovies.reverse()} variant="portrait" />
        <MediaRow title="News" items={dummyMovies} variant="landscape" />

      </main>
    </>
  );
};
