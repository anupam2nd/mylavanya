
import { useState } from "react";

interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
  bgColor: string;
}

const services: Service[] = [
  {
    id: 1,
    title: "Female Salon at Home",
    description: "We provide a range of beauty services at the comfort of your home. From waxing, facials, clean-ups and mani-pedi to body polishing and even hair spa, you name it we have it.",
    image: "/lovable-uploads/saloon-at-home.png",
    bgColor: "bg-pink-100"
  },
  {
    id: 2,
    title: "Female Spa at Home",
    description: "Whether you want to de-stress yourself or get a pain-relieving body massage we have everything in the bucket for you. With this we also cater the needs of elderly, new moms, kids & period pain.",
    image: "/lovable-uploads/hair-service.png",
    bgColor: "bg-green-100"
  },
  {
    id: 3,
    title: "Female Hydra & Laser Treatments",
    description: "As our skin matures, it needs more to maintain its health and glow. Our Hydra Facials at Home are perfect for you if you want instant results with a healthy glow while our at home Laser Treatments are great for hair reduction, pigmentation correction, and skin rejuvenation.",
    image: "/lovable-uploads/makup-service.png",
    bgColor: "bg-purple-100"
  },
  {
    id: 4,
    title: "Bridal Makeup Services",
    description: "Make your special day even more beautiful with our professional bridal makeup services. From engagement to wedding day, we ensure you look stunning for every occasion.",
    image: "/lovable-uploads/Mehendi-service.png",
    bgColor: "bg-blue-100"
  },
  {
    id: 5,
    title: "Male Grooming Services",
    description: "Complete grooming solutions for men including haircuts, beard styling, facials, and wellness treatments. Professional care delivered to your doorstep.",
    image: "/lovable-uploads/Nail-service.png",
    bgColor: "bg-yellow-100"
  }
];

const ServicesSection = () => {
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  return (
    <div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-primary font-medium mb-2 sm:mb-3 text-sm sm:text-base">What We Offer</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Services we offer</h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-primary mx-auto mt-4 sm:mt-6"></div>
          <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base px-4">
            Professional beauty and wellness services delivered to your doorstep
          </p>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group ${
                index === 2 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
            >
              {/* Background with gradient */}
              <div className={`${service.bgColor} h-full transition-all duration-300 group-hover:opacity-90`}>
                {/* Image container */}
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      console.log(`Failed to load image: ${service.image}`);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Content */}
                <div className="p-4 sm:p-5 md:p-6 text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 transition-colors duration-300 group-hover:text-primary leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-xs sm:text-sm md:text-sm line-clamp-4 sm:line-clamp-none">
                    {service.description}
                  </p>
                  
                  {/* Interactive element that appears on hover */}
                  <div className={`mt-3 sm:mt-4 transition-all duration-300 ${
                    hoveredService === service.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>
                    <button className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-full hover:bg-primary/90 transition-colors duration-200 font-medium">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Decorative border that appears on hover */}
              <div className={`absolute inset-0 border-2 border-primary rounded-2xl transition-opacity duration-300 ${
                hoveredService === service.id ? 'opacity-100' : 'opacity-0'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;
