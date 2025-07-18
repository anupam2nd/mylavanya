import { ButtonCustom } from "@/components/ui/button-custom";
import { Calendar, Sparkles } from "lucide-react";
interface BookingBannerProps {
  onBookNow: () => void;
}
const BookingBanner = ({
  onBookNow
}: BookingBannerProps) => {
  return <div className="relative overflow-hidden py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-rose-400 -z-10"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-cyan-950"></div>
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white opacity-10 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white opacity-10 blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full text-white text-sm mb-6 backdrop-blur-sm bg-fuchsia-950">
            <Sparkles size={16} className="mr-2" />
            <span>Limited Time Offer</span>
          </div>
          
          <h2 className="text-3xl font-display font-bold sm:text-4xl mb-6 text-zinc-950">
            Book Your Beauty Experience Today
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto text-zinc-700">Our team of professional makeup artists and hair stylists are ready to transform your look for any special occasion.</p>
          
          <ButtonCustom
            variant="glass"
            size="lg"
            onClick={onBookNow}
            className="hover:bg-blue-100/70 bg-blue-100"
          >
            <Calendar className="mr-2" size={18} />
            Schedule Appointment
          </ButtonCustom>
        </div>
      </div>
    </div>;
};
export default BookingBanner;