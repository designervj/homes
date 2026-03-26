"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError" | "src"> {
  src: string | null | undefined;
  fallbackSrc?: string;
  className?: string;
}

export function SafeImage({
  src,
  fallbackSrc = "/images/placeholder.svg",
  alt,
  className,
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const isValidSrc = src && typeof src === "string" && src.trim() !== "";

  if (error || !isValidSrc) {
    const isFill = (props as any).fill;
    const style = isFill
      ? { position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0, objectFit: "cover" }
      : {};

    const { fill, sizes, priority, quality, ...restProps } = props as any;

    return (
      <img
        {...restProps}
        src={fallbackSrc}
        alt={alt || "Placeholder"}
        className={className}
        style={style as any}
      />
    );
  }

  return (
    <Image
      {...props}
      src={src as string}
      alt={alt || "Image"}
      className={className}
      onError={() => setError(true)}
    />
  );
}
