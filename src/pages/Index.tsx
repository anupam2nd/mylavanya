
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/sections/Hero";
import ServicesSection from "@/components/sections/ServicesSection";
import Testimonials from "@/components/sections/Testimonials";
import BookingBanner from "@/components/sections/BookingBanner";
import AuthModal from "@/components/auth/AuthModal";
import MainLayout from "@/components/layout/MainLayout";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("member");
  const navigate = useNavigate();

  // Log to confirm Index is being loaded
  console.log("Index page rendering");

  const handleLogin = (type: string = "member") => {
    setAuthModalTab(type);
    setIsAuthModalOpen(true);
  };

  return (
    <MainLayout>
      <Hero 
        onBookNow={() => navigate("/services")}
        onLogin={() => handleLogin("member")}
        onArtistLogin={() => handleLogin("artist")}
      />
      <ServicesSection />
      <BookingBanner onBookNow={() => navigate("/services")} />
      <Testimonials />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </MainLayout>
  );
};

export default Index;
