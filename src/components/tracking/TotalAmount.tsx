
interface TotalAmountProps {
  amount: number;
  originalAmount?: number;
}

const TotalAmount = ({ amount, originalAmount }: TotalAmountProps) => {
  const hasDiscount = originalAmount && originalAmount > amount;

  return (
    <div className="col-span-2 mt-4 flex justify-end">
      <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
        <p className="text-sm font-medium text-gray-500">Total Amount</p>
        {hasDiscount ? (
          <div className="flex flex-col">
            <p className="text-sm line-through text-gray-500">₹{originalAmount.toFixed(2)}</p>
            <p className="text-xl font-bold text-primary">₹{amount.toFixed(2)}</p>
          </div>
        ) : (
          <p className="text-xl font-bold">₹{amount.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
};

export default TotalAmount;
