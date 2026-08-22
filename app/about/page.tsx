import { ManualWordRotater } from "../components/ManualWordRotater";
import { ABOUT } from '../constants/about';

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl sm:px-4 py-12 px-8">
      <div className="flex flex-col sm:mb-40 mb-10">
        <div className="flex flex-row items-center">
          <div className="flex flex-col sm:w-[60vw] w-[90vw] sm:min-h-[25vh] sm:min-h-[50vh] min-h-[35vh]">
            <ManualWordRotater
              phrases={ABOUT}
              textClassName="sm:text-4xl text-2xl"
            />
          </div>

          {/* Desktop only */}
          <div className="hidden sm:block aspect-[2/3] w-72 bg-gray-200" />
        </div>

        {/* Mobile: 2/3 + 16/9 together */}
        <div className="flex flex-row items-start gap-2 sm:hidden mt-4">
          <div className="aspect-[2/3] w-[40vw] bg-gray-200" />
          <div className="aspect-[16/9] w-[60vw] bg-gray-200" />
        </div>

        {/* Desktop 16/9 */}
        <div className="hidden sm:block aspect-[16/9] max-w-[40vw] bg-gray-200 mt-4" />
      </div>
      <div className="sm:text-3xl text-2xl flex flex-col sm:gap-20 gap-10">
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
    </main>
  );
}