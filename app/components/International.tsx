import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, MouseEvent } from 'react';

export const International = () => {

    const translations = {'الجتمع':'', '社会':'', 'ህብረተሰብ':'', '사회':'', 'SoCIETY.':'arts-crafts-regular'};
    const [currTrans, setCurrTrans] = useState(0);

    const handleClick = () => {
        setCurrTrans((prevIndex) => (prevIndex + 1) % Object.keys(translations).length);
      };

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
        <div className="w-full overflow-hidden mb-30">

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
            className={`flex justify-center pb-11 overflow-hidden font-${Object.values(translations)[currTrans]}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          >
            {/* Added flex, items-center, and justify-center to lock the core center point */}
            <div className="relative flex items-center justify-center select-none">
              
              {/* Purple Layer (Deepest depth offset) */}
              <motion.h1 
                style={{ x: purpleX, y: purpleY }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-3 ml-3 text-6xl sm:text-9xl text-purple-900 whitespace-nowrap"
              >
                {Object.keys(translations)[currTrans]}
              </motion.h1>

              {/* Fuchsia Layer */}
              <motion.h1 
                style={{ x: fuchsiaX, y: fuchsiaY }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-2 ml-2 text-6xl sm:text-9xl text-fuchsia-700 whitespace-nowrap"
              >
                {Object.keys(translations)[currTrans]}
              </motion.h1>

              {/* Orange Layer */}
              <motion.h1 
                style={{ x: orangeX, y: orangeY }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-1 ml-1 text-6xl sm:text-9xl text-orange-500 whitespace-nowrap"
              >
                {Object.keys(translations)[currTrans]}
              </motion.h1>

              {/* Yellow Layer (Static dead-center on top) */}
              <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl sm:text-9xl text-yellow-500 z-10 whitespace-nowrap">
                {Object.keys(translations)[currTrans]}
              </h1>

              {/* Invisible copy defining the true vertical bounds of the block */}
              <h1 className="invisible text-6xl sm:text-9xl whitespace-nowrap">
                {Object.keys(translations)[currTrans]}
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
    );
}