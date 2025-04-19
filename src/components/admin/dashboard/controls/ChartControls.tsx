
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartControlsProps {
  range: '7d' | '30d' | '90d' | '1y';
  showRatio: boolean;
  onRangeChange: (value: '7d' | '30d' | '90d' | '1y') => void;
  onShowRatioChange: (show: boolean) => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  range,
  showRatio,
  onRangeChange,
  onShowRatioChange
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Select value={range} onValueChange={onRangeChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Time Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>
      
      <Select 
        value={showRatio ? "yes" : "no"} 
        onValueChange={(value) => onShowRatioChange(value === "yes")}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="DAM/MAM Ratio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="yes">Show Ratio</SelectItem>
          <SelectItem value="no">Hide Ratio</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
