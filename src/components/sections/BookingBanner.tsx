
import { ButtonCustom } from "@/components/ui/button-custom";

interface BookingBannerProps {
  onBookNow: () => void;
}

const BookingBanner = ({ onBookNow }: BookingBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-primary to-primary/70 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
            Ready to Book Your Beauty Service?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Our team of professional makeup artists and hair stylists are ready to make your special day perfect.
          </p>
          <ButtonCustom
            variant="glass"
            size="lg"
            onClick={onBookNow}
          >
            Book Your Appointment
          </ButtonCustom>
        </div>
      </div>
    </div>
  );
};

export default BookingBanner;
