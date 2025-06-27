
import { Users, Star, Shield, MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ServiceInfoProps {
  description?: string;
  services: string;
  subservice?: string;
  scheme?: string;
}

const ServiceInfo = ({ description, services, subservice, scheme }: ServiceInfoProps) => {
  return (
    <div className="space-y-6">
      {/* Description */}
      <Card className="p-4 md:p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Service Description</h3>
        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
          {description || "Professional service tailored to your needs."}
        </p>
      </Card>

      {/* Service Details */}
      <Card className="p-4 md:p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Service Details</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm md:text-base">Service: {services}</span>
          </div>
          {subservice && (
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm md:text-base">Specialty: {subservice}</span>
            </div>
          )}
          {scheme && (
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm md:text-base">Package: {scheme}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm md:text-base">Available at your location</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm md:text-base">Flexible timing available</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ServiceInfo;
