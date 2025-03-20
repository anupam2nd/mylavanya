
interface Service {
  ProductName: string;
  Qty: number;
  price: number;
}

interface ServicesListProps {
  services: Service[];
}

const ServicesList = ({ services }: ServicesListProps) => {
  return (
    <div className="col-span-2 mt-4 border-t pt-4">
      <p className="text-sm font-medium text-gray-500 mb-3">Services</p>
      <div className="space-y-3">
        {services.map((service, index) => (
          <div key={index} className="bg-white p-3 rounded-md border">
            <p className="font-medium">{service.ProductName}</p>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <p>Quantity: {service.Qty || 1}</p>
              <p>Price: ₹{service.price?.toFixed(2) || '0.00'}</p>
              <p>Total: ₹{((service.Qty || 1) * service.price)?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesList;
