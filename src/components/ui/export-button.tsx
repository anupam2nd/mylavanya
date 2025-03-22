
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  filename: string;
  headers?: Record<keyof T, string>;
  buttonText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function ExportButton<T extends Record<string, any>>({
  data,
  filename,
  headers,
  buttonText = 'Export CSV',
  variant = 'outline'
}: ExportButtonProps<T>) {
  const { toast } = useToast();
  
  const handleExport = () => {
    try {
      // Generate timestamp for the filename
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const fullFilename = `${filename}_${timestamp}.csv`;
      
      exportToCSV(data, fullFilename, headers);
      
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
    <Button
      variant={variant}
      onClick={handleExport}
      disabled={data.length === 0}
      className="flex items-center"
    >
      <Download className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
}
