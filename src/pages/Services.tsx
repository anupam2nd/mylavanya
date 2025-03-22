
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceList from "@/components/services/ServiceList";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Predefined categories for beauty services
const categories = [
  { id: "all", name: "All Services" },
  { id: "makeup", name: "Makeup" },
  { id: "hair", name: "Hair Styling" },
  { id: "nails", name: "Nail Services" },
  { id: "facial", name: "Facials & Skincare" },
  { id: "bridal", name: "Bridal Packages" },
];

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 flex-grow">
        <div className="bg-gradient-to-r from-violet-100 to-purple-50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Our Beauty Services</h1>
            <p className="mt-2 text-lg text-gray-600">
              Professional beauty services for weddings and special events
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ServiceList categoryFilter={selectedCategory !== "all" ? selectedCategory : undefined} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Services;
