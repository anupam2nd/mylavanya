
import { Loader2 } from "lucide-react";

const ProcessingIndicator = ({ message = "Adding service to booking..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-center text-muted-foreground">{message}</p>
    </div>
  );
};

export default ProcessingIndicator;
