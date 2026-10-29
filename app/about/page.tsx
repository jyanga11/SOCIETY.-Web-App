"use client";

import { useState, useEffect, useRef } from "react";
import { ManualWordRotater } from "../components/ManualWordRotater";
import { ABOUT } from '../constants/about';
import Image from "next/image";
import landscape1 from "@/public/bts_landscape1.jpg";
import landscape2 from "@/public/bts_landscape2.jpg";
import landscape3 from "@/public/bts_landscape3.jpg";
import landscape4 from "@/public/bts_landscape4.jpg";
import portrait1 from "@/public/bts_portrait1.jpg";
import portrait2 from "@/public/bts_portrait2.jpg";
import portrait3 from "@/public/bts_portrait3.jpg";
import portrait4 from "@/public/bts_portrait4.jpg";

const PHOTO_PAIRS = [
  { portrait: portrait1, landscape: landscape1 },
  { portrait: portrait2, landscape: landscape2 },
  { portrait: portrait3, landscape: landscape3 },
  { portrait: portrait4, landscape: landscape4 },
];

export default function AboutPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const photos = PHOTO_PAIRS[activeIndex];
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateAvailableHeight = () => {
      const section = mediaRef.current;
      if (!section) return;

      // Measure the document position so scrolling does not change image sizes.
      const top = section.getBoundingClientRect().top + window.scrollY;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      section.style.setProperty(
        "--media-height",
        `${Math.max(0, viewportHeight - top - 24)}px`,
      );
    };

    updateAvailableHeight();
    window.addEventListener("resize", updateAvailableHeight);
    window.visualViewport?.addEventListener("resize", updateAvailableHeight);
    let active = true;
    void document.fonts.ready.then(() => {
      if (active) updateAvailableHeight();
    });

    return () => {
      active = false;
      window.removeEventListener("resize", updateAvailableHeight);
      window.visualViewport?.removeEventListener("resize", updateAvailableHeight);
    };
  }, []);

  return (
    <main className="relative z-20 mx-auto md:px-30 px-5 py-12">
      <div className="m-2 sm:m-10">
        <div ref={mediaRef} className="
          flex flex-col gap-1 mb-30
          sm:mx-auto sm:w-[90%]
          sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]
          sm:gap-x-34 sm:gap-y-30 sm:items-stretch
          sm:h-[var(--media-height,calc(100svh-12rem))] sm:grid-rows-[auto_minmax(0,1fr)]
        ">
          <div className="flex flex-row gap-1 items-start sm:contents">
            <div className="flex flex-col w-[90dvw] sm:w-auto sm:min-w-0 sm:col-start-1 sm:row-start-1">
              <ManualWordRotater
                phrases={ABOUT}
                textClassName="sm:text-4xl text-2xl"
                onIndexChange={setActiveIndex}
              />
            </div>
            {/* Portrait spans both rows within the available screen height. */}
            <div className="hidden sm:block sm:relative sm:col-start-2 sm:row-start-1 sm:row-span-2 sm:h-full sm:min-h-0">
              <Image src={photos.portrait} alt="" className="max-h-[40dvh] w-auto sm:absolute sm:inset-0 sm:h-full sm:max-h-none sm:w-full sm:object-contain sm:object-left-top"/>
            </div>
          </div>

          {/* Mobile: 2/3 + 16/9 together */}
          <div className="flex flex-row items-start gap-2 sm:hidden mt-4">
            <Image src={photos.portrait} alt="" className=""/>
            <Image src={photos.landscape} alt="" className="min-w-[70dvh]"/>
          </div>

          {/* Desktop 16/9 */}
          <Image src={photos.landscape} alt="" className="hidden sm:block sm:col-start-1 sm:row-start-2 sm:h-full sm:min-h-0 sm:w-full sm:max-w-none sm:object-contain sm:object-left-top"/>
        </div>


        <div className="sm:text-3xl text-2xl flex flex-col sm:gap-40 gap-10">
          <p className="sm:w-[65%] w-[85%] self-start">
            We didn&apos;t start with much.
          </p>
          <p className="sm:w-[65%] w-[85%] self-end -mt-6">
            No blueprints, no big names, no industry connections.
          </p>
          <p className="sm:w-[65%] w-[85%] self-start -mt-6">
            Just vision, ambition, and a relentless belief.
          </p>
          <p className="sm:w-[65%] w-[85%] self-end -mt-6">
            <span className="font-arts-crafts-regular">Society.</span> was born in the margins. We took the long way when others chose the simple route.
          </p>
          <p className="sm:w-[65%] w-[85%] self-start -mt-6">
            Through late nights and quiet doubts we taught ourselves how to create, design, code, and build one project at a time.
          </p>
          <p className="sm:w-[65%] w-[85%] self-end -mt-6">
            We learned the rules just to rewrite them. We made our own lane and now we intend to turn it into a movement.
          </p>
          <p className="sm:w-[65%] w-[85%] self-start -mt-6">
            Because culture doesn&apos;t come from the top down, it rises. From the streets. From the struggle. Built by you and me. Built by <span className="font-arts-crafts-regular">Society.</span>
          </p>
        </div>
      </div>
    </main>
  );
}