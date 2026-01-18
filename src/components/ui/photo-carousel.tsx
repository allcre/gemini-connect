import * as React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Photo {
  id?: string;
  url: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface PhotoCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  photos: Photo[];
  aspectRatio?: "square" | "portrait" | "landscape";
  showDots?: boolean;
  showNavigation?: boolean;
  overlay?: React.ReactNode;
  emptyState?: React.ReactNode;
  onPhotoChange?: (index: number) => void;
}

const aspectRatioClasses = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-video",
};

const PhotoCarousel = React.forwardRef<HTMLDivElement, PhotoCarouselProps>(
  (
    {
      photos,
      aspectRatio = "portrait",
      showDots = true,
      showNavigation = true,
      overlay,
      emptyState,
      onPhotoChange,
      className,
      ...props
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (photos.length > 1) {
        const newIndex = (currentIndex + 1) % photos.length;
        setCurrentIndex(newIndex);
        onPhotoChange?.(newIndex);
      }
    };

    const handlePrev = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (photos.length > 1) {
        const newIndex = (currentIndex - 1 + photos.length) % photos.length;
        setCurrentIndex(newIndex);
        onPhotoChange?.(newIndex);
      }
    };

    if (photos.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative rounded-3xl overflow-hidden bg-muted",
            aspectRatioClasses[aspectRatio],
            className
          )}
          {...props}
        >
          {emptyState || (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
                  👤
                </div>
                <p>No photos yet</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-3xl overflow-hidden bg-muted",
          aspectRatioClasses[aspectRatio],
          className
        )}
        {...props}
      >
        <img
          src={photos[currentIndex]?.url || "/placeholder.svg"}
          alt={`Photo ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation arrows */}
        {showNavigation && photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="carousel-nav carousel-nav-left"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="carousel-nav carousel-nav-right"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {showDots && photos.length > 1 && (
          <div className="carousel-dots">
            {photos.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "carousel-dot",
                  i === currentIndex ? "carousel-dot-active" : "carousel-dot-inactive"
                )}
              />
            ))}
          </div>
        )}

        {/* Custom overlay content */}
        {overlay && <div className="photo-overlay">{overlay}</div>}
      </div>
    );
  }
);
PhotoCarousel.displayName = "PhotoCarousel";

export { PhotoCarousel };
