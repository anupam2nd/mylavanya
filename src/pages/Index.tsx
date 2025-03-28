
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/sections/Hero";
import ServiceList from "@/components/services/ServiceList";
import HowItWorks from "@/components/sections/HowItWorks";
import Testimonials from "@/components/sections/Testimonials";
import BookingBanner from "@/components/sections/BookingBanner";
import AuthModal from "@/components/auth/AuthModal";
import MainLayout from "@/components/layout/MainLayout";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  // Log to confirm Index is being loaded
  console.log("Index page rendering");

  return (
    <MainLayout 
      showAnnouncement={true}
      announcementBackgroundImage="/lovable-uploads/d9a82f47-9bdb-4fc4-93d0-5fbcff7b79ed.jpg"
    >
      <Hero 
        onBookNow={() => navigate("/services")}
        onLogin={() => setIsAuthModalOpen(true)}
        // You can change the heroImage prop here to use a different image
        // heroImage="/path/to/your/new/image.jpg"
      />
      <ServiceList featured={true} />
      <HowItWorks />
      <BookingBanner onBookNow={() => navigate("/services")} />
      <Testimonials />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </MainLayout>
  );
};

export default Index;
