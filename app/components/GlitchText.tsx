"use client";

import { useEffect, useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export default function GlitchText({
  text,
  className = "",
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!hovering) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";

            if (index < iteration) {
              return text[index];
            }

            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      iteration += 0.35;

      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [hovering, text]);

  return (
    <span
      className={className}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {displayText}
    </span>
  );
}