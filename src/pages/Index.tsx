
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/sections/Hero";
import ServicesSection from "@/components/sections/ServicesSection";
import Testimonials from "@/components/sections/Testimonials";
import BookingBanner from "@/components/sections/BookingBanner";
import AuthModal from "@/components/auth/AuthModal";
import MainLayout from "@/components/layout/MainLayout";
import BannerSlider from "@/components/ui/BannerSlider";

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
      
      {/* Banner Slider - Only visible on lg screens and above */}
      <div className="hidden lg:block bg-gradient-to-b from-secondary/10 to-background py-8">
        <div className="container mx-auto px-4">
          <BannerSlider />
        </div>
      </div>
      
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
