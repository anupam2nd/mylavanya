
import { ButtonCustom } from "@/components/ui/button-custom";
import { Calendar, Sparkles } from "lucide-react";

interface BookingBannerProps {
  onBookNow: () => void;
}

const BookingBanner = ({ onBookNow }: BookingBannerProps) => {
  return (
    <div className="relative overflow-hidden py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-rose-400 -z-10"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.4)_0%,_transparent_70%)]"></div>
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white opacity-10 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white opacity-10 blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 text-white text-sm mb-6 backdrop-blur-sm border border-white/30">
            <Sparkles size={16} className="mr-2" />
            <span className="font-medium">Limited Time Offer</span>
          </div>
          
          <h2 className="text-3xl font-display font-bold text-white sm:text-4xl mb-6">
            Book Your Beauty Experience Today
          </h2>
          <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
            Our team of professional makeup artists and hair stylists are ready to transform your look for any special occasion.
          </p>
          
          <ButtonCustom
            variant="glass"
            size="lg"
            onClick={onBookNow}
            className="hover:bg-white/30 backdrop-blur-md"
          >
            <Calendar className="mr-2" size={18} />
            Schedule Appointment
          </ButtonCustom>
        </div>
      </div>
    </div>
  );
};

export default BookingBanner;
