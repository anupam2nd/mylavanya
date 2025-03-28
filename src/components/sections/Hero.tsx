
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { ButtonCustom } from "@/components/ui/button-custom";

interface HeroProps {
  onBookNow: () => void;
  onLogin: () => void;
  heroImage?: string; // Added prop for customizable hero image
}

const Hero = ({
  onBookNow,
  onLogin,
  heroImage = "/lovable-uploads/25ad58d4-efa9-46a1-a5b9-e3dfcec4e593.png" // Default image as fallback
}: HeroProps) => {
  return <div className="relative bg-gradient-to-b from-secondary/30 to-background pt-28 pb-24 sm:pt-32 sm:pb-32 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/40 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="relative inline-block">
              <img 
                src={heroImage} 
                alt="Beauty Services Banner" 
                className="rounded-full w-64 h-64 object-cover mx-auto lg:mx-0 mb-4"
              />
              <div className="absolute bottom-0 left-0 right-0 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm mb-2">
                <Sparkles size={16} className="mr-2" />
                <span>Premium Beauty Services</span>
              </div>
            </div>
            
            <h1 className="font-display font-bold tracking-tight">
              <span className="block">Enhance Your</span>
              <span className="block text-gradient">Natural Beauty</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mt-6 max-w-lg mx-auto lg:mx-0">
              Professional makeup artists, hair stylists, and beauty services for weddings, 
              events, and special occasions delivered at your doorstep.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <ButtonCustom variant="primary-gradient" size="lg" onClick={onBookNow} className="group">
                Book Your Service 
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </ButtonCustom>
              
              <ButtonCustom variant="outline" size="lg" onClick={onLogin} className="border-primary/20 text-foreground">
                Sign In
              </ButtonCustom>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start space-x-4 text-sm text-muted-foreground pt-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} className="text-primary fill-primary" />)}
              </div>
              <span>500+ Happy Clients</span>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary rounded-full"></div>
            <div className="absolute -bottom-10 -right-6 w-36 h-36 bg-accent/30 rounded-full"></div>
            <div className="relative z-10">
              <img alt="Beauty Services" src="/lovable-uploads/0b9c4ec6-8c62-4d2f-a9b8-bfcf1f87fabd.jpg" className="w-full h-auto rounded-2xl shadow-card object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>;
};

export default Hero;
