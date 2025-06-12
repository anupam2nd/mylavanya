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
    title: "Hair Services at Home",
    description:
      "From stylish haircuts to spa, color, and therapy – our professionals deliver salon-quality hair services at home for both men and women.",
    image: "images/we-offer/Hair.jpeg",
    bgColor: "bg-pink-100",
  },
  {
    id: 2,
    title: "Makeup at Home",
    description:
      "Get Party, Bridal, or everyday makeup done by experts in your own space. For all occasions. Choose services from various range in just one click.",
    image: "images/we-offer/Makeup.jpeg",
    bgColor: "bg-green-100",
  },
  {
    id: 3,
    title: "Mehendi Services at Home",
    description:
      "Beautiful and artistic mehendi designs applied at home for weddings, festivals, or just self-love.",
    image: "images/we-offer/Mehendi.jpeg",
    bgColor: "bg-purple-100",
  },
  {
    id: 4,
    title: "Nail Art and Extensions",
    description:
      "Trendy and elegant nail art, extensions, and care services at home. Perfect for those who love well-groomed hands",
    image: "images/we-offer/Nail.jpeg",
    bgColor: "bg-blue-100",
  },
  {
    id: 5,
    title: "Salon Services at Home",
    description:
      "Premium salon services for men and women, right at your doorstep. Enjoy comfort, hygiene, and expert care at home.",
    image: "images/we-offer/Salon.jpeg",
    bgColor: "bg-yellow-100",
  },
];

const ServicesSection = () => {
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  return (
    <div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-primary font-medium mb-2 sm:mb-3 text-sm sm:text-base">
            What We Offer
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Services we offer
          </h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-primary mx-auto mt-4 sm:mt-6"></div>
          <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base px-4">
            Look Good, Feel Great — Without Leaving Home
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`relative w-full overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group ${
                index === 2 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
            >
              {/* Background with gradient */}
              <div
                className={`w-full h-full transition-all duration-300 group-hover:opacity-90`}
              >
                {/* Image container */}
                <div className="relative w-full h-48 ">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      console.log(`Failed to load image: ${service.image}`);
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  {/* Overlay gradient */}
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> */}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 md:p-6 text-center">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 transition-colors duration-300 group-hover:text-primary leading-tight">
                    {service.title}
                  </h3>
                  {/* <p className="text-gray-700 leading-relaxed text-xs sm:text-sm md:text-sm line-clamp-4 sm:line-clamp-none">
                    {service.description}
                  </p> */}

                  {/* Interactive element that appears on hover */}
                  <div
                    className={`mt-3 sm:mt-4 transition-all duration-300 ${
                      hoveredService === service.id
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  >
                    <button className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-full hover:bg-primary/90 transition-colors duration-200 font-medium">
                      View More
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative border that appears on hover */}
              {/* <div
                className={`absolute inset-0 border-2 border-primary rounded-2xl transition-opacity duration-300 ${
                  hoveredService === service.id ? "opacity-100" : "opacity-0"
                }`}
              ></div> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;
