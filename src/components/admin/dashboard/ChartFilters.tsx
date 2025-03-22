
import React from "react";
import { Filter, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChartFiltersProps {
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

const ChartFilters: React.FC<ChartFiltersProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  applyFilters,
  resetFilters,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleApply = () => {
    applyFilters();
    setIsOpen(false);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1">
            <Filter className="h-4 w-4 mr-1" />
            {startDate && endDate ? (
              <span className="text-xs">
                {format(startDate, "MMM dd")} - {format(endDate, "MMM dd")}
              </span>
            ) : (
              "Filter Charts"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Date Range</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="start-date"
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "MMM dd, yyyy") : <span>Pick date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="end-date">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="end-date"
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "MMM dd, yyyy") : <span>Pick date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
              >
                Reset
              </Button>
              <Button 
                size="sm" 
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChartFilters;
