
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Calendar } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  filename: string;
  headers?: Partial<Record<keyof T, string>>;
  buttonText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  dateField?: keyof T;
}

export function ExportButton<T extends Record<string, any>>({
  data,
  filename,
  headers,
  buttonText = 'Export CSV',
  variant = 'outline',
  dateField
}: ExportButtonProps<T>) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showDateFilters, setShowDateFilters] = useState(false);
  
  // Function to filter data by date range if dateField is provided
  const filterDataByDateRange = () => {
    if (!dateField || !startDate || !endDate) return data;
    
    return data.filter(item => {
      // Handle various date formats (string, Date object, etc.)
      let itemDate: Date;
      const dateValue = item[dateField];
      
      if (!dateValue) return false;
      
      if (dateValue instanceof Date) {
        itemDate = dateValue;
      } else if (typeof dateValue === 'string') {
        itemDate = new Date(dateValue);
      } else {
        return false;
      }
      
      // Set time to beginning and end of day for proper comparison
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      return itemDate >= start && itemDate <= end;
    });
  };

  const handleExport = () => {
    try {
      // Apply date filtering if date filters are active
      const filteredData = showDateFilters ? filterDataByDateRange() : data;
      
      // Generate timestamp for the filename
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const fullFilename = `${filename}_${timestamp}.csv`;
      
      // Add date range to filename if filters are applied
      const dateRangeFilename = showDateFilters && startDate && endDate 
        ? `${filename}_${format(startDate, 'yyyyMMdd')}_to_${format(endDate, 'yyyyMMdd')}_${timestamp}.csv` 
        : fullFilename;
      
      if (showDateFilters && filteredData.length === 0) {
        toast({
          title: "No data in selected date range",
          description: "Please select a different date range",
          variant: "destructive"
        });
        return;
      }
      
      exportToCSV(filteredData, dateRangeFilename, headers);
      
      toast({
        title: "Export successful",
        description: `Your report has been downloaded (${filteredData.length} records)`,
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

  const resetDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Only show date filter options if dateField is provided
  if (!dateField) {
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

  return (
    <Popover open={showDateFilters} onOpenChange={setShowDateFilters}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          className="flex items-center"
          disabled={data.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          {buttonText}
          {showDateFilters && 
            <span className="ml-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden="true"></span>
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Filter Before Export</h3>
            <p className="text-sm text-gray-500">Select a date range to filter data</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <div className="mt-1">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => endDate ? date > endDate : false}
                  className="border rounded-md"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <div className="mt-1">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => startDate ? date < startDate : false}
                  className="border rounded-md"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetDateFilters}
            >
              Reset
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDateFilters(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleExport}
                disabled={!startDate || !endDate}
              >
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
