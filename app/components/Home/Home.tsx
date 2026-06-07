import { WordRotater } from "../WordRotater";
import { PHRASES } from '../../constants/phrases';

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

        <section className="min-h-[30vh] px-3 sm:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="flex flex-col text-xl sm:text-6xl">
              <span className="pl-0">
                Uplifting{" "}
                <span className="font-arts-crafts-regular text-2xl sm:text-7xl text-orange-500">
                  culture
                </span>{" "}
              </span>
              <span className="pl-12 sm:pl-48">through </span>
              <span className="pl-24 sm:pl-96">
                <span className="font-arts-crafts-regular text-2xl sm:text-7xl text-purple-700">
                  art
                </span>
                {" & "}
                <span className="font-arts-crafts-regular text-2xl sm:text-7xl text-purple-700">
                  technology
                </span>
                {"."}
              </span>
            </h2>
          </div>
        </section>

        <section className="flex flex-col sm:flex-row w-full sm:px-20 py-20">
          
          <div className="py:20 sm:px-20">
            <h3 className="text-xl sm:text-3xl font-arts-crafts-regular">
              Skills
            </h3>
            <ul className="text-3xl sm:text-6xl">
              <li>Brand Identity</li>
              <li>Creative Direction</li>
              <li>Content Strategy</li>
              <li>Web Development</li>
              <li>E-Commerce</li>
              <li>Videography</li>
              <li>Audio Mixing</li>
            </ul>
          </div>

          <div className="w-full sm:max-w-[40vw]">
            <p className="text-xl sm:text-4xl">
              <span className="font-arts-crafts-regular">SoCIETY.</span> is a <WordRotater phrases={PHRASES} /><br></br>
              built from the ground up for and by those that never had a blueprint but always had a vision. Our mission is to equip traditionally under-represented creatives with the tools, knowledge, platform, and support to transform their raw ideas into cultural movements that reject the status quo.
            </p>
          </div>

        </section>
      </main>
    </>
  );
};
