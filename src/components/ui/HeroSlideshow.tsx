
import { useEffect, useState } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "./carousel";

const slideImages = [
  "/images/slide/slide1.jpg",
  "/images/slide/slide2.jpg",
  "/images/slide/slide3.jpg",
  "/images/slide/slide4.jpg",
  "/images/slide/slide5.jpg"
];

const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slideImages.length - 1 ? 0 : prev + 1));
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/10 rounded-2xl z-0"></div>
      
      <Carousel className="w-full" 
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {slideImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="p-2">
                <div className="overflow-hidden rounded-xl border-2 border-white/30 shadow-lg relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 mix-blend-overlay z-10"></div>
                  <img 
                    src={image} 
                    alt={`Beauty service slide ${index + 1}`}
                    className="w-full h-[400px] object-cover transition-all duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/40 border-white/30" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/40 border-white/30" />
        
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
          {slideImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index 
                  ? "bg-primary w-4" 
                  : "bg-white/50 hover:bg-white/80"
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default HeroSlideshow;
