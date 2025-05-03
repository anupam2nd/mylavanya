
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { StatusOption } from "@/hooks/useStatusOptions";
import { exportToCSV } from "@/utils/exportUtils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AdminStatusHeaderProps {
  filteredStatuses: StatusOption[];
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
}

const AdminStatusHeader = ({ 
  filteredStatuses, 
  showAddForm, 
  setShowAddForm 
}: AdminStatusHeaderProps) => {
  const { toast } = useToast();

  const handleExportCSV = () => {
    try {
      // Custom headers for better readability
      const headers = {
        status_code: 'Status Code',
        status_name: 'Status Name',
        description: 'Description',
        active: 'Active',
        id: 'ID'
      };
      
      // Generate timestamp for the filename
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const fileName = `statuses_export_${timestamp}.csv`;
      
      exportToCSV(filteredStatuses, fileName, headers);
      
      toast({
        title: "Export successful",
        description: "Your report has been downloaded",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "There was a problem creating your report",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <CardTitle>Status List</CardTitle>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline"
          onClick={handleExportCSV}
          className="flex items-center"
          disabled={filteredStatuses.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          {showAddForm ? 'Hide Form' : 'Add New Status'}
        </button>
      </div>
    </div>
  );
};

export default AdminStatusHeader;
