
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
  const [heroImageUrl, setHeroImageUrl] = useState("/lovable-uploads/0b9c4ec6-8c62-4d2f-a9b8-bfcf1f87fabd.jpg");
  const navigate = useNavigate();

  // Log to confirm Index is being loaded
  console.log("Index page rendering");

  // Function to handle hero image update
  const updateHeroImage = (newUrl: string) => {
    setHeroImageUrl(newUrl);
  };

  return (
    <MainLayout 
      showAnnouncement={true}
      announcementBackgroundImage="/lovable-uploads/d9a82f47-9bdb-4fc4-93d0-5fbcff7b79ed.jpg"
    >
      <div className="mb-4 p-4 bg-secondary/10 rounded-lg max-w-screen-lg mx-auto mt-4">
        <h3 className="text-lg font-medium mb-2">Update Hero Image</h3>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-md"
          />
          <button 
            onClick={() => updateHeroImage(heroImageUrl)}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Apply Image
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Paste any image URL including uploaded images from `/lovable-uploads/` folder
        </p>
      </div>
      
      <Hero 
        onBookNow={() => navigate("/services")}
        onLogin={() => setIsAuthModalOpen(true)}
        heroImage={heroImageUrl}
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
