
import { useState } from "react";
import { Star, Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Create an easily customizable testimonials array
// This can be edited directly or replaced with data from an API or CMS
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Bride",
    content: "The makeup artist was amazing! My wedding day look was perfect and lasted all day and night. Highly recommend their services.",
    rating: 5,
    image: "/placeholder.svg" // Replace with actual image path when available
  },
  {
    id: 2,
    name: "Emily Davis",
    role: "Event Organizer",
    content: "We hired their team for a corporate event. The service was professional and everyone looked great. Will definitely book again.",
    rating: 5,
    image: "/placeholder.svg" // Replace with actual image path when available
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Birthday Girl",
    content: "Booked for my birthday party. The hairstylist was creative and gave me exactly what I wanted. The team was punctual and professional.",
    rating: 4,
    image: "/placeholder.svg" // Replace with actual image path when available
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-3">Testimonials</p>
          <h2 className="text-3xl font-bold sm:text-4xl">What Our Clients Say</h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-6"></div>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground">
            Hear from people who have experienced our services
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="relative"
            setApi={(api) => {
              api?.on("select", () => {
                setActiveIndex(api.selectedScrollSnap());
              });
            }}
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <div 
                    className={`
                      bg-background p-8 rounded-2xl shadow-card border border-accent/20
                      ${activeIndex === index ? "scale-105" : "scale-95 opacity-80"}
                      transition-all duration-300
                    `}
                  >
                    <div className="mb-6 relative">
                      <Quote className="text-accent-foreground/10 absolute -top-2 -left-2" size={40} />
                      <p className="text-muted-foreground relative z-10">{testimonial.content}</p>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-4 bg-gray-100">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            // Fallback for image loading errors
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-primary">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 sm:-left-12" />
            <CarouselNext className="right-0 sm:-right-12" />
          </Carousel>

          {/* Testimonial indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-3 w-3 rounded-full transition-colors ${
                  activeIndex === index ? "bg-primary" : "bg-gray-300"
                }`}
                onClick={() => {
                  document.querySelectorAll("[data-carousel-item]")[index].scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                  });
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
