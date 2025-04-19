
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MemberDataPoint } from '@/utils/memberDataGenerator';

interface EventAnnotationsProps {
  annotations: MemberDataPoint[];
}

export const EventAnnotations: React.FC<EventAnnotationsProps> = ({ annotations }) => {
  if (annotations.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Events:</h4>
      <div className="flex flex-wrap gap-2">
        {annotations.map((item, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className="flex items-center gap-1 border-emerald-500"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span className="font-medium">
              {item.formattedDate} - {item.event}:
            </span> 
            {item.eventDescription}
          </Badge>
        ))}
      </div>
    </div>
  );
};
