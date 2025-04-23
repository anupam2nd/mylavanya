
import { Loader2 } from "lucide-react";

const BookingFormLoader = () => (
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center space-x-3">
    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    <span className="font-medium">Loading your information...</span>
  </div>
);

export default BookingFormLoader;
