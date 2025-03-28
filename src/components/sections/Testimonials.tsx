
import { useState } from "react";
import { Star, Quote, Edit2, Check } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import AvatarUpload from "@/components/testimonials/AvatarUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Create an easily customizable testimonials array
// This can be edited directly or replaced with data from an API or CMS
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Bride",
    content: "The makeup artist was amazing! My wedding day look was perfect and lasted all day and night. Highly recommend their services.",
    rating: 5,
    // Use Unsplash images for better quality testimonial photos
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&h=256&q=80"
  },
  {
    id: 2,
    name: "Emily Davis",
    role: "Event Organizer",
    content: "We hired their team for a corporate event. The service was professional and everyone looked great. Will definitely book again.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&h=256&q=80"
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Birthday Girl",
    content: "Booked for my birthday party. The hairstylist was creative and gave me exactly what I wanted. The team was punctual and professional.",
    rating: 4,
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&h=256&q=80"
  },
];

/*
  INSTRUCTIONS FOR CUSTOMIZING TESTIMONIALS:
  
  1. To edit testimonials, simply update the testimonials array above
  2. For each testimonial, you can modify:
     - name: The person's name
     - role: Their role or title
     - content: The testimonial text
     - rating: A number from 1-5
     - image: URL to their profile photo (recommended size: 256x256)
  
  3. To add a new testimonial, copy an existing object and change the values
     Make sure to give it a unique ID
  
  Example:
  {
    id: 4,
    name: "Alex Wong",
    role: "Regular Client",
    content: "I've been using Lavanya's services for years. Always satisfied!",
    rating: 5,
    image: "https://example.com/alex-photo.jpg"
  }
*/

interface EditingState {
  id: number | null;
  field: 'name' | 'role' | 'content' | null;
}

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [localTestimonials, setLocalTestimonials] = useState(testimonials);
  const [editing, setEditing] = useState<EditingState>({ id: null, field: null });
  
  // Check if we're in the Lovable editor environment
  // This is a simple way to detect if we're in the editor vs. deployed site
  const isInLovableEditor = window.location.hostname.includes('lovable.dev') || 
                            window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';

  const handleImageChange = (id: number, newImageUrl: string) => {
    setLocalTestimonials(prevTestimonials =>
      prevTestimonials.map(testimonial =>
        testimonial.id === id
          ? { ...testimonial, image: newImageUrl }
          : testimonial
      )
    );
  };

  const handleTextChange = (id: number, field: 'name' | 'role' | 'content', value: string) => {
    setLocalTestimonials(prevTestimonials =>
      prevTestimonials.map(testimonial =>
        testimonial.id === id
          ? { ...testimonial, [field]: value }
          : testimonial
      )
    );
  };

  const handleRatingChange = (id: number, newRating: number) => {
    setLocalTestimonials(prevTestimonials =>
      prevTestimonials.map(testimonial =>
        testimonial.id === id
          ? { ...testimonial, rating: newRating }
          : testimonial
      )
    );
  };

  const startEditing = (id: number, field: 'name' | 'role' | 'content') => {
    setEditing({ id, field });
  };

  const stopEditing = () => {
    setEditing({ id: null, field: null });
  };

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
                // Stop editing when carousel slides
                stopEditing();
              });
            }}
          >
            <CarouselContent>
              {localTestimonials.map((testimonial, index) => (
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
                      
                      {isInLovableEditor && editing.id === testimonial.id && editing.field === 'content' ? (
                        <div className="relative z-10">
                          <Textarea
                            value={testimonial.content}
                            onChange={(e) => handleTextChange(testimonial.id, 'content', e.target.value)}
                            className="min-h-[100px] text-foreground"
                            autoFocus
                          />
                          <button 
                            onClick={stopEditing}
                            className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="relative z-10 group">
                          <p className="text-muted-foreground">{testimonial.content}</p>
                          {isInLovableEditor && (
                            <button 
                              onClick={() => startEditing(testimonial.id, 'content')}
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-muted p-1 rounded-md"
                            >
                              <Edit2 size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          } ${isInLovableEditor ? "cursor-pointer" : ""}`}
                          onClick={() => isInLovableEditor && handleRatingChange(testimonial.id, i + 1)}
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-4 bg-gray-100">
                        <AvatarUpload
                          initialImage={testimonial.image}
                          name={testimonial.name}
                          onImageChange={(imageUrl) => handleImageChange(testimonial.id, imageUrl)}
                          size="md"
                          editable={isInLovableEditor}
                        />
                      </div>
                      <div>
                        {isInLovableEditor && editing.id === testimonial.id && editing.field === 'name' ? (
                          <div className="relative">
                            <Input
                              value={testimonial.name}
                              onChange={(e) => handleTextChange(testimonial.id, 'name', e.target.value)}
                              className="py-0 h-7 text-foreground font-medium"
                              autoFocus
                            />
                            <button 
                              onClick={stopEditing}
                              className="absolute top-1 right-2 bg-primary text-white p-0.5 rounded-full"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="relative group">
                            <p className="font-medium text-foreground">{testimonial.name}</p>
                            {isInLovableEditor && (
                              <button 
                                onClick={() => startEditing(testimonial.id, 'name')}
                                className="absolute top-0 right-[-20px] opacity-0 group-hover:opacity-100 transition-opacity bg-muted p-0.5 rounded-md"
                              >
                                <Edit2 size={10} />
                              </button>
                            )}
                          </div>
                        )}
                        
                        {isInLovableEditor && editing.id === testimonial.id && editing.field === 'role' ? (
                          <div className="relative">
                            <Input
                              value={testimonial.role}
                              onChange={(e) => handleTextChange(testimonial.id, 'role', e.target.value)}
                              className="py-0 h-6 text-sm text-primary"
                              autoFocus
                            />
                            <button 
                              onClick={stopEditing}
                              className="absolute top-1 right-2 bg-primary text-white p-0.5 rounded-full"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="relative group">
                            <p className="text-sm text-primary">{testimonial.role}</p>
                            {isInLovableEditor && (
                              <button 
                                onClick={() => startEditing(testimonial.id, 'role')}
                                className="absolute top-0 right-[-20px] opacity-0 group-hover:opacity-100 transition-opacity bg-muted p-0.5 rounded-md"
                              >
                                <Edit2 size={10} />
                              </button>
                            )}
                          </div>
                        )}
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
            {localTestimonials.map((_, index) => (
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
