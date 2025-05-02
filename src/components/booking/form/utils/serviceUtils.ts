
import { Service } from "../types/ServiceTypes";

// Format service name as "Services - Subservice - ProductName"
export const formatServiceName = (service: Service): string => {
  const parts = [];
  if (service.Services) parts.push(service.Services);
  if (service.Subservice) parts.push(service.Subservice);
  if (service.ProductName) parts.push(service.ProductName);
  
  return parts.join(' - ');
};

// Get final price (NetPayable or calculated discount price)
export const getFinalPrice = (service: Service): number => {
  if (service.NetPayable !== null && service.NetPayable !== undefined) {
    return service.NetPayable;
  } else if (service.Discount) {
    return service.Price - (service.Price * service.Discount / 100);
  } else {
    return service.Price;
  }
};
