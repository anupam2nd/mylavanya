
interface TotalAmountProps {
  amount: number;
}

const TotalAmount = ({ amount }: TotalAmountProps) => {
  return (
    <div className="col-span-2 mt-4 flex justify-end">
      <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
        <p className="text-sm font-medium text-gray-500">Total Amount</p>
        <p className="text-xl font-bold">₹{amount.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default TotalAmount;
