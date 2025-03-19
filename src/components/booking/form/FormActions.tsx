
import { ButtonCustom } from "@/components/ui/button-custom";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel?: () => void;
}

const FormActions = ({ isSubmitting, onCancel }: FormActionsProps) => {
  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
      <ButtonCustom
        type="submit"
        className="flex-1"
        variant="primary-gradient"
        disabled={isSubmitting}
        isLoading={isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Book Appointment"}
      </ButtonCustom>
      
      {onCancel && (
        <ButtonCustom 
          type="button" 
          onClick={onCancel}
          className="flex-1"
          variant="outline"
        >
          Cancel
        </ButtonCustom>
      )}
    </div>
  );
};

export default FormActions;
