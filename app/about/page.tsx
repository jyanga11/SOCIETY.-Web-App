import { ManualWordRotater } from "../components/ManualWordRotater";
import { ABOUT } from '../constants/about';

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col mb-40">
        <div className="flex flex-row items-center">
          <div className="flex flex-col w-[60vw] pr-10">
            <ManualWordRotater phrases={ABOUT} textClassName="text-4xl" />
          </div>
          <div className="aspect-[2/3] w-72 bg-gray-200 rounded-lg" />
        </div>
        <div className="aspect-[16/9] max-w-[40vw] bg-gray-200 rounded-lg" />
      </div>
      <div className="text-3xl flex flex-col gap-20">
        <p className="w-[65%] self-start">
          We didn&apos;t start with much.
        </p>
        <p className="w-[65%] self-end -mt-6">
          No blueprints, no big names, no safety nets.
        </p>
        <p className="w-[65%] self-start -mt-6">
          Just vision, ambition, and a relentless belief that culture should be shaped by those who live it.
        </p>
        <p className="w-[65%] self-end -mt-6">
          <span className="font-arts-crafts-regular">Society.</span> was born in the margins. We took the long way. Through late nights and quiet doubts.
        </p>
        <p className="w-[65%] self-start -mt-6">
          We used what we had. We learned by doing and failed forward. We taught ourselves how to create, design, code, and build one project at a time.
        </p>
        <p className="w-[65%] self-end -mt-6">
          We learned the rules just to rewrite them. We made our own lane and we intend to turn it into a movement.
        </p>
        <p className="w-[65%] self-start -mt-6">
          Because culture doesn&apos;t come from the top down, it rises. From the streets. From the struggle. From you and me. Culture is built by <span className="font-arts-crafts-regular">Society.</span>
        </p>
      </div>
    </main>
  );
}