
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Bride",
    content: "The makeup artist was amazing! My wedding day look was perfect and lasted all day and night.",
    rating: 5,
  },
  {
    name: "Emily Davis",
    role: "Event Organizer",
    content: "We hired their team for a corporate event. The service was professional and everyone looked great.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Birthday Girl",
    content: "Booked for my birthday party. The hairstylist was creative and gave me exactly what I wanted.",
    rating: 4,
  },
];

const Testimonials = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">What Our Clients Say</h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600">
            Hear from people who have experienced our services
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 italic mb-6">{testimonial.content}</p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
