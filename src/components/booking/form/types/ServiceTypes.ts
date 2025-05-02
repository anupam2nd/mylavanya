
export interface Service {
  prod_id: number;
  ProductName: string;
  Price: number;
  Services: string;
  Subservice: string;
  NetPayable: number | null;
  Discount: number | null;
}

export interface SelectedService {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  quantity?: number;
}
