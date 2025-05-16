
import { useState } from "react";
import { testimonials as initialTestimonials } from "../testimonials/TestimonialData";
import TestimonialCarousel from "../testimonials/TestimonialCarousel";

const Testimonials = () => {
  const [localTestimonials, setLocalTestimonials] = useState(initialTestimonials);
  
  // Check if we're in the Lovable editor environment
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
        
        <TestimonialCarousel 
          testimonials={localTestimonials}
          isEditable={isInLovableEditor}
          onTextChange={handleTextChange}
          onRatingChange={handleRatingChange}
          onImageChange={handleImageChange}
        />
      </div>
    </div>
  );
};

export default Testimonials;
