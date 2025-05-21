
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PricingCalculatorProps {
  price: string;
  discount: string;
  netPayable: string;
  onPriceChange: (value: string) => void;
  onDiscountChange: (value: string) => void;
  onNetPayableChange: (value: string) => void;
}

const PricingCalculator = ({
  price,
  discount,
  netPayable,
  onPriceChange,
  onDiscountChange,
  onNetPayableChange,
}: PricingCalculatorProps) => {
  const [priceFirst, setPriceFirst] = useState(true);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onPriceChange(value);
    
    if (priceFirst && discount) {
      const priceValue = parseFloat(value) || 0;
      const discountValue = parseFloat(discount) || 0;
      const calculatedNetPayable = priceValue * (1 - discountValue / 100);
      onNetPayableChange(calculatedNetPayable.toFixed(2));
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onDiscountChange(value);
    
    if (priceFirst && price) {
      const priceValue = parseFloat(price) || 0;
      const discountValue = parseFloat(value) || 0;
      const calculatedNetPayable = priceValue * (1 - discountValue / 100);
      onNetPayableChange(calculatedNetPayable.toFixed(2));
    }
  };

  const handleNetPayableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onNetPayableChange(value);
    
    if (!priceFirst && price) {
      const priceValue = parseFloat(price) || 0;
      const netPayableValue = parseFloat(value) || 0;
      if (priceValue > 0) {
        const calculatedDiscount = ((priceValue - netPayableValue) / priceValue) * 100;
        onDiscountChange(calculatedDiscount.toFixed(2));
      }
    }
  };

  const toggleCalculationMode = () => {
    setPriceFirst(!priceFirst);
  };

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="service-price" className="text-right">
          Price (₹)*
        </Label>
        <Input
          id="service-price"
          type="number"
          value={price}
          onChange={handlePriceChange}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <div className="text-right flex items-center justify-end">
          <Label htmlFor="calculation-mode" className="mr-2">
            Price first
          </Label>
          <Switch
            id="calculation-mode"
            checked={priceFirst}
            onCheckedChange={toggleCalculationMode}
          />
        </div>
        <div className="col-span-3 text-sm text-muted-foreground">
          {priceFirst 
            ? "Enter price and discount % to calculate net payable" 
            : "Enter price and net payable to calculate discount %"}
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="discount" className="text-right">
          Discount %
        </Label>
        <Input
          id="discount"
          type="number"
          value={discount}
          onChange={handleDiscountChange}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="net-payable" className="text-right">
          Net Payable (₹)
        </Label>
        <Input
          id="net-payable"
          type="number"
          value={netPayable}
          onChange={handleNetPayableChange}
          className="col-span-3"
        />
      </div>
    </>
  );
};

export default PricingCalculator;
