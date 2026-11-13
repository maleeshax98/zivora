"use client";

import React, { useState } from "react";
import { CldImage as BaseCldImage, type CldImageProps } from "next-cloudinary";
import { cn } from "@/lib/utils";

export interface SharedCloudinaryImageProps extends Omit<CldImageProps, "alt"> {
  alt: string;
  aspectRatio?: number | string;
  wrapperClassName?: string;
  showSkeleton?: boolean;
}

/**
 * Shared Cloudinary Image wrapper supporting responsive sizing, loading placeholders,
 * aspect-ratio preservation, and graceful fallback.
 */
export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  aspectRatio,
  wrapperClassName,
  className,
  showSkeleton = true,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  config,
  onLoad,
  ...props
}: SharedCloudinaryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback cloud name to prevent runtime crashes when env variable is missing
  const cloudName =
    config?.cloud?.cloudName ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "demo";

  // Calculate aspect ratio string for style if provided
  const computedAspectRatio =
    aspectRatio !== undefined
      ? typeof aspectRatio === "number"
        ? `${aspectRatio}`
        : aspectRatio
      : width && height
      ? `${width} / ${height}`
      : undefined;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-subtle",
        wrapperClassName
      )}
      style={{
        aspectRatio: computedAspectRatio,
      }}
    >
      {/* Skeleton Loading State */}
      {showSkeleton && !isLoaded && !hasError && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-surface-subtle"
        />
      )}

      {/* Error Fallback State */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-xs text-copy-secondary">
          <span>Unable to load image</span>
        </div>
      ) : (
        <BaseCldImage
          src={src}
          alt={alt}
          width={width || 800}
          height={height || 600}
          sizes={sizes}
          config={{
            cloud: {
              cloudName,
            },
            ...config,
          }}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500 ease-out",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={(e) => {
            setIsLoaded(true);
            onLoad?.(e);
          }}
          onError={() => {
            setHasError(true);
          }}
          {...props}
        />
      )}
    </div>
  );
}

export { CloudinaryImage as CldImageWrapper };
export default CloudinaryImage;
