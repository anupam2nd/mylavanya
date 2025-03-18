
import { ArrowRight } from "lucide-react";
import { ButtonCustom } from "@/components/ui/button-custom";

interface HeroProps {
  onBookNow: () => void;
  onLogin: () => void;
}

const Hero = ({ onBookNow, onLogin }: HeroProps) => {
  return (
    <div className="relative bg-gradient-to-r from-violet-100 to-purple-50 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-gray-900">
              <span className="block">Professional Beauty</span>
              <span className="block text-primary">For Your Special Day</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-lg mx-auto lg:mx-0">
              Professional makeup artists, hair stylists, and beauty services for weddings, 
              events, and special occasions.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <ButtonCustom 
                variant="primary-gradient" 
                size="lg" 
                onClick={onBookNow}
                className="group"
              >
                Book Now 
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </ButtonCustom>
              <ButtonCustom
                variant="outline"
                size="lg"
                onClick={onLogin}
              >
                Sign In
              </ButtonCustom>
            </div>
          </div>
          <div className="hidden lg:block">
            <img 
              src="/placeholder.svg"
              alt="Beauty Services" 
              className="w-full h-auto rounded-lg shadow-xl" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
