
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TestimonialCard from "./TestimonialCard";
import { Testimonial } from "./TestimonialData";

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  isEditable: boolean;
  onTextChange: (id: number, field: 'name' | 'role' | 'content', value: string) => void;
  onRatingChange: (id: number, newRating: number) => void;
  onImageChange: (id: number, newImageUrl: string) => void;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
  isEditable,
  onTextChange,
  onRatingChange,
  onImageChange
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
    skipSnaps: false,
    dragFree: false,
  });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Auto-scrolling functionality
  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', onSelect);
    onSelect();
    
    // Set up auto-scrolling interval
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        emblaApi.scrollNext();
      }
    }, 6000); // Slide every 6 seconds for better readability
    
    return () => {
      clearInterval(intervalId);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="max-w-7xl mx-auto relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 pl-4"
              role="group"
              aria-roledescription="slide"
            >
              <TestimonialCard
                testimonial={testimonial}
                isActive={activeIndex === index}
                isEditable={isEditable}
                onTextChange={onTextChange}
                onRatingChange={onRatingChange}
                onImageChange={onImageChange}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced navigation buttons */}
      <button 
        onClick={scrollPrev}
        className="absolute left-0 sm:-left-16 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full glass-card border border-white/40 flex items-center justify-center z-10 shadow-xl hover:shadow-2xl transition-all duration-300 group backdrop-blur-xl"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
      </button>
      <button 
        onClick={scrollNext}
        className="absolute right-0 sm:-right-16 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full glass-card border border-white/40 flex items-center justify-center z-10 shadow-xl hover:shadow-2xl transition-all duration-300 group backdrop-blur-xl"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
      </button>

      {/* Enhanced testimonial indicators */}
      <div className="flex justify-center mt-12 space-x-3">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`h-3 w-3 rounded-full transition-all duration-500 ${
              activeIndex === index 
                ? "bg-gradient-to-r from-primary to-purple-600 scale-125 shadow-lg w-8" 
                : "bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:scale-110"
            }`}
            onClick={() => {
              emblaApi?.scrollTo(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
