import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface BlogCarouselProps {
  images: string[];
}

export const BlogCarousel: React.FC<BlogCarouselProps> = ({ images }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Single image, no carousel needed
  if (images.length === 1) {
    return (
      <div className="w-full aspect-video mb-12 shadow-sm">
        <img
          src={images[0]}
          alt="Blog post image"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full mb-12">
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((imageUrl, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <div className="w-full aspect-video shadow-sm">
                <img
                  src={imageUrl}
                  alt={`Blog post image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-paper/90 hover:bg-paper text-ink p-3 rounded-full shadow-lg transition-all hover:scale-110"
        aria-label="Previous image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-paper/90 hover:bg-paper text-ink p-3 rounded-full shadow-lg transition-all hover:scale-110"
        aria-label="Next image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Indicator Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex
                ? 'bg-gold w-8'
                : 'bg-ink/40 hover:bg-ink/60'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Image Counter */}
      <div className="text-center mt-2 text-sm text-ink/60">
        {selectedIndex + 1} / {images.length}
      </div>
    </div>
  );
};
