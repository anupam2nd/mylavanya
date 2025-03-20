
interface BookingReferenceProps {
  reference: string;
}

const BookingReference = ({ reference }: BookingReferenceProps) => {
  return (
    <div className="col-span-2 bg-primary/10 p-4 rounded-md border border-primary/20 mb-2">
      <p className="text-sm font-medium text-gray-500">Booking Reference</p>
      <p className="text-xl font-bold text-red-600">{reference}</p>
    </div>
  );
};

export default BookingReference;
