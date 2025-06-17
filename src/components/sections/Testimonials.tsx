import { useState } from "react";
import { testimonials as initialTestimonials } from "../testimonials/TestimonialData";
import TestimonialCarousel from "../testimonials/TestimonialCarousel";
const Testimonials = () => {
  const [localTestimonials, setLocalTestimonials] = useState(initialTestimonials);

  // Check if we're in the Lovable editor environment
  const isInLovableEditor = window.location.hostname.includes('lovable.dev') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const handleImageChange = (id: number, newImageUrl: string) => {
    setLocalTestimonials(prevTestimonials => prevTestimonials.map(testimonial => testimonial.id === id ? {
      ...testimonial,
      image: newImageUrl
    } : testimonial));
  };
  const handleTextChange = (id: number, field: 'name' | 'role' | 'content', value: string) => {
    setLocalTestimonials(prevTestimonials => prevTestimonials.map(testimonial => testimonial.id === id ? {
      ...testimonial,
      [field]: value
    } : testimonial));
  };
  const handleRatingChange = (id: number, newRating: number) => {
    setLocalTestimonials(prevTestimonials => prevTestimonials.map(testimonial => testimonial.id === id ? {
      ...testimonial,
      rating: newRating
    } : testimonial));
  };
  return <section className="py-16 md:py-24 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-300/20 to-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Updated header to match other sections */}
        <div className="text-center mb-16 animate-slide-up">
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary font-semibold text-xs uppercase tracking-wider rounded-full mb-4">
            Client Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            What Our <span className="text-gradient">Clients Say</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the experiences of our valued clients who have trusted us with their beauty journey. 
            Their stories inspire us to deliver excellence every day.
          </p>
        </div>
        
        <TestimonialCarousel testimonials={localTestimonials} isEditable={isInLovableEditor} onTextChange={handleTextChange} onRatingChange={handleRatingChange} onImageChange={handleImageChange} />
      </div>
    </section>;
};
export default Testimonials;