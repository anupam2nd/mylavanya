
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { useNavigate as useReactRouterNavigate } from "react-router-dom"
import { ShoppingBag } from "lucide-react"

// Custom hook to safely use navigation
const useNavigateSafe = () => {
  try {
    // Try to use the navigate hook but catch any errors
    return useReactRouterNavigate();
  } catch (error) {
    // Return a no-op function if navigate isn't available
    return () => console.warn("Navigation attempted outside Router context");
  }
};

export function Toaster() {
  const { toasts } = useToast()
  const navigate = useNavigateSafe()

  const handleNavigate = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.warn("Failed to navigate:", error);
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Check if this is a booking success toast by looking for the booking reference
        const isBookingSuccess = typeof description === 'string' && 
          description.includes('booking reference number');

        let formattedDescription = description;
        
        // Format the booking reference if this is a booking success toast
        if (isBookingSuccess && typeof description === 'string') {
          // Split the description by newlines
          const lines = description.split('\n');
          
          // Process each line to enhance formatting
          formattedDescription = (
            <div className="space-y-2">
              {lines.map((line, index) => {
                // If this is the booking reference line
                if (line.includes('booking reference number')) {
                  const [before, after] = line.split(':');
                  return (
                    <div key={index} className="font-medium">
                      {before}:
                      <span className="text-2xl font-bold text-red-600 ml-2">
                        {after.trim()}
                      </span>
                    </div>
                  );
                }
                // If this is the payment note
                else if (line.includes('not confirmed')) {
                  return (
                    <div key={index} className="font-semibold text-lg bg-red-50 p-2 rounded border border-red-200 text-red-700 mt-2 flex justify-between items-center">
                      <span>{line}</span>
                      <Button 
                        onClick={() => handleNavigate('/user/checkout')} 
                        className="ml-4 flex items-center gap-2"
                        size="sm"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Checkout
                      </Button>
                    </div>
                  );
                }
                // Regular line
                else {
                  return <div key={index}>{line}</div>;
                }
              })}
            </div>
          );
        }

        return (
          <Toast key={id} {...props} className="fixed top-4 left-0 right-0 mx-auto max-w-md z-50">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-lg font-bold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-base">
                  {formattedDescription}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
