
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/sections/Hero";
import ServiceList from "@/components/services/ServiceList";
import HowItWorks from "@/components/sections/HowItWorks";
import Testimonials from "@/components/sections/Testimonials";
import BookingBanner from "@/components/sections/BookingBanner";
import AuthModal from "@/components/auth/AuthModal";
import Navbar from "@/components/layout/Navbar";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero 
        onBookNow={() => navigate("/services")}
        onLogin={() => setIsAuthModalOpen(true)}
      />
      <ServiceList featured={true} />
      <HowItWorks />
      <BookingBanner onBookNow={() => navigate("/services")} />
      <Testimonials />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Index;
