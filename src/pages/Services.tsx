
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter } from "lucide-react";
import ServiceList from "@/components/services/ServiceList";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
          <div className="flex justify-between items-center mb-6">
            <div className="font-medium">
              {selectedCategory === "all" ? "All Services" : `Category: ${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}`}
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  <span className="hidden sm:inline-block">Filter</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Services</SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  <h3 className="font-medium mb-4">Categories</h3>
                  <RadioGroup 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                    className="space-y-2"
                  >
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={category.id} id={`category-${category.id}`} />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <ServiceList categoryFilter={selectedCategory !== "all" ? selectedCategory : undefined} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Services;
