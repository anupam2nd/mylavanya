
import { useEffect, useState, useRef } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "./carousel";

const slideImages = [
    "/lovable-uploads/1187f0cd-cebd-4a82-b452-bd10a533ec8a.png",
  "/lovable-uploads/5e4422e9-6278-43af-8311-c38f392b88ea.png",
  "/lovable-uploads/43f7f919-15dd-41f5-b87b-2fcb7214ddcb.png",
  "/lovable-uploads/fede23ba-d554-4d60-9b58-63d9e73c3d4a.png",
  "/lovable-uploads/61675467-d5c8-4b35-88c2-2ad11ccc7296.png",
  "/lovable-uploads/af122554-9480-4403-ab38-d124a3d8956f.png",
  "/lovable-uploads/69f38c02-dc33-40a1-9c88-a24b8445712c.png",
  "/lovable-uploads/aec1f01a-da7c-4d35-bdf2-ef891e20cca2.png",
  "/lovable-uploads/1ef09f3f-f1fe-4e09-abec-857f95e780db.png",
  "/lovable-uploads/a72340f7-4bae-4ad0-890c-cd1f3a5df5dc.png",
];

const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  
  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);
  
  // Auto-advance slides
  useEffect(() => {
    if (!api) return;
    
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/10 rounded-2xl z-0"></div>
      
      <Carousel className="w-full" 
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setApi}
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
                    className="w-full h-[600px] object-cover transition-all duration-500 hover:scale-105"
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
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default HeroSlideshow;
