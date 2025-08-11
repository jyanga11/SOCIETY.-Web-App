'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [showLoading, setShowLoading] = useState(true);
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const staticText = "is a ";
  const phrases = [
    "creative collective.",
    "design agency.",
    "lifestyle brand.",
    "record label.",
    "production house.",
    "multi-media hub."
  ];
  const currentPhrase = phrases[currentPhraseIndex];

  useEffect(() => {
    let typeInterval: NodeJS.Timeout;
    let backspaceInterval: NodeJS.Timeout;
    let pauseTimer: NodeJS.Timeout;

    if (isTyping) {
      // Typing effect
      let currentIndex = 0;
      typeInterval = setInterval(() => {
        if (currentIndex <= currentPhrase.length) {
          setDisplayText(currentPhrase.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          // Pause before backspacing
          pauseTimer = setTimeout(() => {
            setIsTyping(false);
          }, 1500); // Wait 1 second before backspacing
        }
      }, 90); // Speed of typing
    } else {
      // Backspacing effect
      let currentIndex = currentPhrase.length;
      backspaceInterval = setInterval(() => {
        if (currentIndex >= 0) {
          setDisplayText(currentPhrase.slice(0, currentIndex));
          currentIndex--;
        } else {
          clearInterval(backspaceInterval);
          // Move to next phrase
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          setIsTyping(true);
        }
      }, 60); // Faster backspacing
    }

    return () => {
      clearInterval(typeInterval);
      clearInterval(backspaceInterval);
      clearTimeout(pauseTimer);
    };
  }, [isTyping, currentPhrase, currentPhraseIndex, phrases.length]);

  // Hide loading screen after 5 seconds
  useEffect(() => {
    const hideTimer = setTimeout(() => {
      setShowLoading(false);
    }, 20000);

    return () => clearTimeout(hideTimer);
  }, []);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white fixed inset-0 z-50">
        <div className="text-center">
          <h1 className="font-semibold mb-4">
            <span className="font-arts-crafts-regular text-2xl sm:text-4xl md:text-6xl">SoCIETY.</span>
            <span className="font-sans text-xl sm:text-2xl md:text-4xl"> {staticText}</span>
            <span className="font-sans text-xl sm:text-2xl md:text-4xl inline-block w-40 sm:w-80 md:w-96 text-left">
              {displayText}
              <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
                <div className="inline-block w-2 h-4 sm:w-3 sm:h-8 md:w-4 md:h-8 bg-white"></div>
              </span>
            </span>
          </h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
