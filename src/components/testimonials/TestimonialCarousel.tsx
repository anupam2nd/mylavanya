
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
  });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="max-w-5xl mx-auto relative">
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

      <button 
        onClick={scrollPrev}
        className="absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background border border-input flex items-center justify-center z-10 shadow-sm hover:bg-accent hover:text-accent-foreground"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button 
        onClick={scrollNext}
        className="absolute right-0 sm:-right-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background border border-input flex items-center justify-center z-10 shadow-sm hover:bg-accent hover:text-accent-foreground"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Testimonial indicators */}
      <div className="flex justify-center mt-8 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`h-3 w-3 rounded-full transition-colors ${
              activeIndex === index ? "bg-primary" : "bg-gray-300"
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
