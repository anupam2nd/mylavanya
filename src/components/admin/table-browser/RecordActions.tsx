
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface RecordActionsProps {
  recordId: number;
  onEdit: (recordId: number) => void;
  onDelete: (recordId: number) => void;
}

const RecordActions: React.FC<RecordActionsProps> = ({ recordId, onEdit, onDelete }) => {
  return (
    <div className="text-right space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onEdit(recordId)}
      >
        <Edit className="h-4 w-4 mr-1" /> Edit
      </Button>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => onDelete(recordId)}
      >
        <Trash2 className="h-4 w-4 mr-1" /> Delete
      </Button>
    </div>
  );
};

export default RecordActions;
