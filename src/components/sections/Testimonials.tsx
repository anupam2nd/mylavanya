
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
    <div className="py-24 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-300/20 to-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
            </svg>
          </div>
          
          <p className="text-primary font-semibold text-lg mb-3 tracking-wide">CLIENT TESTIMONIALS</p>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            What Our Clients Say
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-600 mx-auto mb-6"></div>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground leading-relaxed">
            Discover the experiences of our valued clients who have trusted us with their beauty journey. 
            Their stories inspire us to deliver excellence every day.
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
