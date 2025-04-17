
import React from "react";

interface ServiceImageSectionProps {
  image: string;
  productName: string;
  description: string;
}

const ServiceImageSection: React.FC<ServiceImageSectionProps> = ({ 
  image, 
  productName, 
  description 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-64 sm:h-80 bg-gray-200">
        <img alt={productName} className="w-full h-full object-cover" src={image} />
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
        <p className="text-gray-600 mb-6">
          {description || "Professional beauty service tailored for weddings and special occasions. Our expert team uses premium products to ensure you look your best on your special day."}
        </p>
        
        <h3 className="text-xl font-medium mb-3">What's Included</h3>
        <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
          <li>Professional makeup application</li>
          <li className="text-base font-semibold">Consultation to understand your preferences</li>
          <li>Premium quality products</li>
          <li>Touch-ups for perfect finish</li>
        </ul>
        
        <h3 className="text-xl font-medium mb-3">Additional Information</h3>
        <p className="text-gray-600">
          Our services are available for on-site appointments. We bring all necessary equipment to your location, whether it's a hotel, home, or venue.
        </p>
      </div>
    </div>
  );
};

export default ServiceImageSection;
