import { WordRotater } from "../WordRotater";
import { PHRASES } from '../../constants/phrases';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MouseEvent } from 'react';



export const Home = () => {
  // 1. Track raw mouse coordinates relative to the screen/container
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 2. Add a spring effect so the movement is fluid and silky smooth
  const springConfig = { damping: 25, stiffness: 150 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  // 3. Create different ranges of movement for each layer (Staggering the effect)
  // The deeper layers (purple) move more, creating depth.
  const purpleX = useTransform(mouseX, [-300, 300], [-25, 25]);
  const purpleY = useTransform(mouseY, [-300, 300], [-25, 25]);

  const fuchsiaX = useTransform(mouseX, [-300, 300], [-15, 15]);
  const fuchsiaY = useTransform(mouseY, [-300, 300], [-15, 15]);

  const orangeX = useTransform(mouseX, [-300, 300], [-8, 8]);
  const orangeY = useTransform(mouseY, [-300, 300], [-8, 8]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Calculate mouse position relative to the center of the container
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left - width / 2;
    const mouseYPos = e.clientY - rect.top - height / 2;

    x.set(mouseXPos);
    y.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    // Reset back to center when mouse leaves
    x.set(0);
    y.set(0);
  };

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

          <div className="w-full sm:max-w-[40vw]">
            <p className="text-xl sm:text-4xl">
              <span className="font-arts-crafts-regular">SoCIETY.</span> is a <WordRotater phrases={PHRASES} /><br></br>
              built from the ground up for and by those that never had a blueprint but always had a vision. Our mission is to equip traditionally under-represented creatives with the tools, knowledge, platform, and support to transform their raw ideas into cultural movements that reject the status quo.
            </p>
          </div>

        </section>

        <div className="w-full overflow-hidden">

          {/* --- TOP BANNER (Panning Left) --- */}
          <div className="relative flex w-full overflow-hidden border-y border-orange-500 text-xl tracking-wider text-orange-500">
            <motion.div 
              className="flex whitespace-nowrap gap-4 pr-4 flex-shrink-0"
              animate={{ x: [0, "-50%"] }}
              transition={{
                ease: "linear",
                duration: 15,
                repeat: Infinity,
              }}
            >
              <div className="flex gap-4 shrink-0">
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
              </div>
              
              <div className="flex gap-4 shrink-0" aria-hidden="true">
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
              </div>
            </motion.div>
          </div>

          <section 
            className="flex justify-center pb-11 overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Added flex, items-center, and justify-center to lock the core center point */}
            <div className="relative flex items-center justify-center select-none">
              
              {/* Purple Layer (Deepest depth offset) */}
              <motion.h1 
                style={{ x: purpleX, y: purpleY }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-3 ml-3 text-6xl sm:text-9xl text-purple-900 whitespace-nowrap"
              >
                المجتمع
              </motion.h1>

              {/* Fuchsia Layer */}
              <motion.h1 
                style={{ x: fuchsiaX, y: fuchsiaY }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-2 ml-2 text-6xl sm:text-9xl text-fuchsia-700 whitespace-nowrap"
              >
                المجتمع
              </motion.h1>

              {/* Orange Layer */}
              <motion.h1 
                style={{ x: orangeX, y: orangeY }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-1 ml-1 text-6xl sm:text-9xl text-orange-500 whitespace-nowrap"
              >
                المجتمع
              </motion.h1>

              {/* Yellow Layer (Static dead-center on top) */}
              <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl sm:text-9xl text-yellow-500 z-10 whitespace-nowrap">
                المجتمع
              </h1>

              {/* Invisible copy defining the true vertical bounds of the block */}
              <h1 className="invisible text-6xl sm:text-9xl whitespace-nowrap">
                المجتمع
              </h1>
            </div>
          </section>

          {/* --- BOTTOM BANNER (Panning Right) --- */}
          <div className="relative flex w-full overflow-hidden border-y border-orange-500 text-xl tracking-wider text-orange-500">
            <motion.div 
              className="flex whitespace-nowrap gap-4 pr-4 flex-shrink-0"
              animate={{ x: ["-50%", 0] }}
              transition={{
                ease: "linear",
                duration: 15,
                repeat: Infinity,
              }}
            >
              <div className="flex gap-4 shrink-0">
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
              </div>
              
              <div className="flex gap-4 shrink-0" aria-hidden="true">
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
                <span>Lose Yourself. Find <span className="font-arts-crafts-regular">SoCIETY.</span></span>
              </div>
            </motion.div>
          </div>

        </div>

      </main>
    </>
  );
};
