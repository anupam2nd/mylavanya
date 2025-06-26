
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "./carousel";

interface BannerImage {
  id: number;
  image_url: string;
  status: boolean;
}

const BannerSlider = () => {
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannerImages = async () => {
      try {
        const { data, error } = await supabase
          .from('BannerImageMST')
          .select('id, image_url, status')
          .eq('status', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching banner images:', error);
          return;
        }

        setBannerImages(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBannerImages();
  }, []);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });

    // Auto-advance slides
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />
    );
  }

  if (bannerImages.length === 0) {
    return null; // Don't render anything if no banner images
  }

  return (
    <div className="w-full relative">
      <Carousel 
        className="w-full" 
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setApi}
      >
        <CarouselContent>
          {bannerImages.map((image) => (
            <CarouselItem key={image.id}>
              <div className="w-full">
                <div className="bg-muted rounded-lg overflow-hidden" style={{ height: '700px', border : "1px solid black" }}>
                  <img 
                    src={image.image_url} 
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {bannerImages.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/40 border-white/30" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/40 border-white/30" />
            
            {/* Slide indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index 
                      ? "bg-white w-6" 
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
};

export default BannerSlider;
