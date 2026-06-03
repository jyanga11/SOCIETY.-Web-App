"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        className="absolute right-6 size-6 shrink-0 rounded-full bg-foreground/20"
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="absolute right-6 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-90"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    />
  );
}
