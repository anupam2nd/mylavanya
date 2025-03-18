
import { CheckCircle, CalendarDays, Star, UserCircle } from "lucide-react";

const steps = [
  {
    title: "Browse Services",
    description: "Explore our range of professional beauty services",
    icon: CheckCircle,
  },
  {
    title: "Book Appointment",
    description: "Choose a date and time that works for you",
    icon: CalendarDays,
  },
  {
    title: "Get Serviced",
    description: "Our professionals will arrive at your location",
    icon: Star,
  },
  {
    title: "Share Feedback",
    description: "Let us know about your experience",
    icon: UserCircle,
  }
];

const HowItWorks = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600">
            Book your beauty services in just a few simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                <p className="text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
