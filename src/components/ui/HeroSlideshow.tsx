
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
  "/lovable-uploads/80760050-36af-4279-88e1-c6c18a63dc64.png",
  "/lovable-uploads/8973a2ef-29e7-40b3-8186-277bd5124e28.png",
  "/lovable-uploads/8709d9d4-99a2-4f3d-b0b2-947283994525.png",
  "/lovable-uploads/f6cafb16-47a5-4d53-952d-f2ce968cb9c5.png",
  "/lovable-uploads/14cd0ec2-c36f-40d3-a2c8-a09bdf2bf310.png",
  "/lovable-uploads/9cc7bd78-7aef-467b-98f7-634d68bafdfd.png",
  "/lovable-uploads/fa2918ac-9aa8-4130-9d9a-85b1079b859b.png",
  "/lovable-uploads/cdcd2ad8-ca36-4515-9683-5f73b6726d75.png",
  "/lovable-uploads/f13f05ac-b021-4198-be25-c5fed2d9be23.png",
  "/lovable-uploads/9abed376-6e26-4a0d-b5da-d54506ff8e7a.png"
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
