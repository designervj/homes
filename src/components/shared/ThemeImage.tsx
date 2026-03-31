"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { useTheme } from "next-themes";

interface ThemeImageProps extends Omit<ImageProps, "src"> {
  lightSrc: string;
  darkSrc: string;
}

export function ThemeImage({
  lightSrc,
  darkSrc,
  alt,
  ...props
}: ThemeImageProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Standard server-side fallback or before mounting
  const src = mounted && resolvedTheme === "dark" ? darkSrc : lightSrc;

  return (
    <Image
      {...props}
      src={src}
      alt={alt || "Logo"}
    />
  );
}
