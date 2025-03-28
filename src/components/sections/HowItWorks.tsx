import { CheckCircle, CalendarDays, Star, UserCircle } from "lucide-react";
const steps = [{
  title: "Browse Services",
  description: "Explore our range of professional beauty services",
  icon: CheckCircle
}, {
  title: "Book Appointment",
  description: "Choose a date and time that works for you",
  icon: CalendarDays
}, {
  title: "Get Serviced",
  description: "Our professionals will arrive at your location",
  icon: Star
}, {
  title: "Share Feedback",
  description: "Let us know about your experience",
  icon: UserCircle
}];
const HowItWorks = () => {
  return <div className="py-24 bg-gradient-to-b from-background to-accent/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-3">Simple Process</p>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-6"></div>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground">
            Book your beauty services in just a few simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => <div key={index} className="bg-white p-8 rounded-2xl shadow-card hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-md"></div>
                <div className="relative h-16 w-16 rounded-full flex items-center justify-center bg-secondary text-primary">
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="change the writing of this particular text box with \"Explore our wide ranges of professional Makeup & Beauty services.\"">{step.description}</p>
            </div>)}
        </div>
      </div>
    </div>;
};
export default HowItWorks;