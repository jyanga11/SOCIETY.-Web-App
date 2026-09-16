import { WordRotater } from "../WordRotater";
import { International } from "../International"
import { PHRASES } from '../../constants/phrases';
import GlitchText from "../GlitchText";
import MediaRow from "../MediaRow";
import Link from "next/link";
import { getProjects, getProducts, getNews } from '@/sanity/lib/queries'
import { ChevronRight } from 'lucide-react'; // Install lucide-react for clean icons
import { FadeIn } from "../FadeIn";

export async function Home() {
  
  const [projects, products, news] = await Promise.all([
    getProjects(),
    getProducts(),
    getNews(),
  ])
  
  return (
    <>
      <main className="relative z-10">
        <section className="flex min-h-screen pt-[30vh] sm:pt-[40vh] justify-center">
          <FadeIn>
            <div className="relative">
              <h1 className="absolute left-1 top-1 sm:left-1.5 sm:top-1.5 text-6xl sm:text-8xl md:text-9xl font-arts-crafts-regular text-orange-500">
                SoCIETY.
              </h1>

              <h1 className="relative text-6xl sm:text-8xl md:text-9xl font-arts-crafts-regular text-purple-700">
                SoCIETY.
              </h1>
            </div>
          </FadeIn>
        </section>

        <section className="sm:min-h-[30vh] min-h-[15vh] px-3 sm:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <FadeIn>
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
            </FadeIn>
          </div>
        </section>

        <section className="flex flex-col gap-6 sm:flex-row w-full sm:px-20 px-7 py-30">
          
          <FadeIn className="sm:px-20" delay={0}>
            <Link href="/services">
              <h3 className="text-2xl sm:text-3xl font-arts-crafts-regular flex items-center">
                <GlitchText text="Skills"/> <ChevronRight className="h-6 w-6" />
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
            </Link>
          </FadeIn>

          <FadeIn className="w-full sm:max-w-[45vw]" delay={0.15}>
            <Link href="/about">
              <p className="text-xl sm:text-4xl">
                <span className="font-arts-crafts-regular"><GlitchText text="Society."/></span> is a <WordRotater phrases={PHRASES} /><br></br>
                built from the ground up for and by those that never had a blueprint but always had a vision. Our mission is to equip traditionally under-represented creatives with the tools, knowledge, platform, and support to transform their raw ideas into cultural movements that reject the status quo.
              </p>
            </Link>
          </FadeIn>

        </section>

        <International />

        <FadeIn>
          <Link href="/projects" >
            <h2 className="flex items-center text-2xl font-arts-crafts-regular md:text-4xl pl-4 md:pl-12">
              <GlitchText text="Projects"/> <ChevronRight className="h-6 w-6" />
            </h2>
          </Link>
        </FadeIn>
        <FadeIn delay={0.1}>
          <MediaRow items={projects} type="projects" variant="landscape"/>
        </FadeIn>

        <FadeIn>
          <Link href="/shop" >  
            <h2 className="flex items-center text-2xl font-arts-crafts-regular md:text-4xl pl-4 md:pl-12">
              <GlitchText text="Shop"/> <ChevronRight className="h-6 w-6" />
            </h2>
          </Link>
        </FadeIn>
        <FadeIn delay={0.1}>
          <MediaRow items={products} type="shop" variant="portrait" />
        </FadeIn>

        <FadeIn>
          <Link href="/news" >  
            <h2 className="flex items-center text-2xl font-arts-crafts-regular md:text-4xl pl-4 md:pl-12">
              <GlitchText text="News"/> <ChevronRight className="h-6 w-6" />
            </h2>
          </Link>
        </FadeIn>
        <FadeIn delay={0.1}>
          <MediaRow items={news} type="news" variant="landscape" />
        </FadeIn>

      </main>
    </>
  );
};