
import { ArrowRight, Sparkles, Star, Users } from "lucide-react";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import HeroSlideshow from "@/components/ui/HeroSlideshow";
import ParticlesBackground from "@/components/ui/ParticlesBackground";
import MobileBannerSlider from "@/components/ui/MobileBannerSlider";
import MobileCategoryServices from "@/components/ui/MobileCategoryServices";
import ArtistApplicationDialog from "@/components/artist/ArtistApplicationDialog";
import { useState } from "react";

interface HeroProps {
  onBookNow: () => void;
  onLogin: () => void;
  onArtistLogin: () => void;
}

const Hero = ({
  onBookNow,
  onLogin,
  onArtistLogin
}: HeroProps) => {
  const isMobile = useIsMobile();
  const [isArtistApplicationOpen, setIsArtistApplicationOpen] = useState(false);

  // Mobile version with banner slider and category services
  if (isMobile) {
    return (
      <div className="bg-gradient-to-b from-secondary/30 to-background -mt-16 pt-20 pb-8">
        <div className="container mx-auto px-4 space-y-6">
          {/* Mobile Banner Slider */}
          <MobileBannerSlider />
          
          {/* Mobile Category Services */}
          <MobileCategoryServices />
        </div>
        
        <ArtistApplicationDialog 
          isOpen={isArtistApplicationOpen}
          onClose={() => setIsArtistApplicationOpen(false)}
        />
      </div>
    );
  }

  // Desktop version
  return (
    <div className="relative bg-gradient-to-b from-secondary/30 to-background overflow-hidden py-16 md:py-24 lg:py-[50px] -mt-16 pt-32">
      {/* Particles Background - extends to cover navbar area */}
      <ParticlesBackground id="hero-particles" />
      
      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/40 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-[29px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm mb-2 animate-bounce-soft">
              <Sparkles size={16} className="mr-2" />
              <span>Premium Beauty Services</span>
            </div>
            
            <h1 className="font-display font-bold tracking-tight">
              <span className="block text-left font-extrabold font-serif text-5xl">A Blend of Beauty & Grace</span>
              <span className="block text-gradient font-semibold font-sans mx-0 my-[31px] text-4xl">-at Your Doorstep</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mt-6 max-w-lg mx-auto lg:mx-0 my-[16px]">
              Professional makeup artists, hair stylists, and beauty services for weddings, events, and special occasions delivered at your DOORSTEP.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <ButtonCustom variant="primary-gradient" size="lg" onClick={onBookNow} className="group">
                Book Your Service 
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </ButtonCustom>
              
              <ButtonCustom variant="primary-outline" size="lg" onClick={() => setIsArtistApplicationOpen(true)} className="group">
                <Users className="mr-2" size={18} />
                Join Our Makeup Team
              </ButtonCustom>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start space-x-4 text-sm text-muted-foreground pt-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} className="text-primary fill-primary" />)}
              </div>
              <span>1000+ Happy Clients</span>
            </div>
          </div>
          
          {/* Replace static desktop image with slideshow */}
          <div className="hidden lg:block relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary rounded-full"></div>
            <div className="absolute -bottom-10 -right-6 w-36 h-36 bg-accent/30 rounded-full"></div>
            <div className="relative z-10">
              <HeroSlideshow />
            </div>
          </div>
        </div>
      </div>
      
      <ArtistApplicationDialog 
        isOpen={isArtistApplicationOpen}
        onClose={() => setIsArtistApplicationOpen(false)}
      />
    </div>
  );
};

export default Hero;
