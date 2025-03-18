
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/sections/Hero";
import ServiceList from "@/components/services/ServiceList";
import HowItWorks from "@/components/sections/HowItWorks";
import Testimonials from "@/components/sections/Testimonials";
import BookingBanner from "@/components/sections/BookingBanner";
import AuthModal from "@/components/auth/AuthModal";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  // Log to confirm Index is being loaded
  console.log("Index page rendering");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero 
          onBookNow={() => navigate("/services")}
          onLogin={() => setIsAuthModalOpen(true)}
        />
        <ServiceList featured={true} />
        <HowItWorks />
        <BookingBanner onBookNow={() => navigate("/services")} />
        <Testimonials />
      </main>
      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Index;
