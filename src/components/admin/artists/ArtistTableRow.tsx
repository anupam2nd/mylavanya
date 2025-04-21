
import { Artist } from "@/types/artist";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ArtistTableRowProps {
  artist: Artist;
  onEdit: (artist: Artist) => void;
  onDelete: (artist: Artist) => void;
  onToggleStatus: (artist: Artist) => void;
  onViewActivity: (artist: Artist) => void;
  isSuperAdmin?: boolean;
}

const ArtistTableRow = ({
  artist,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewActivity,
  isSuperAdmin = true,
}: ArtistTableRowProps) => (
  <tr className="group">
    <td className="font-medium">
      {artist.ArtistFirstName} {artist.ArtistLastName}
      {artist.ArtistEmpCode && (
        <div className="text-xs text-muted-foreground">{artist.ArtistEmpCode}</div>
      )}
    </td>
    <td>{artist.emailid || 'N/A'}</td>
    <td>{artist.ArtistPhno || 'N/A'}</td>
    <td>
      {artist.ArtistRating !== null ? (
        <div className="flex items-center">
          <span className={`font-medium ${
            artist.ArtistRating >= 4 ? 'text-green-600' : 
            artist.ArtistRating >= 3 ? 'text-amber-600' : 
            'text-red-600'
          }`}>
            {artist.ArtistRating.toFixed(1)}
          </span>
          <span className="text-muted-foreground ml-1">/5</span>
        </div>
      ) : (
        <span className="text-muted-foreground">Not rated</span>
      )}
    </td>
    <td>
      {artist.created_at ? new Date(artist.created_at).toLocaleDateString() : 'N/A'}
    </td>
    <td>
      <div className="flex items-center space-x-2">
        <Switch 
          checked={artist.Active === true} 
          onCheckedChange={() => onToggleStatus(artist)}
        />
        <StatusBadge status={artist.Active ? "approve" : "cancel"}>
          {artist.Active ? 'Active' : 'Inactive'}
        </StatusBadge>
      </div>
    </td>
    <td className="text-right space-x-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onViewActivity(artist)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View Activity</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(artist)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Artist</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-destructive hover:text-destructive/90"
              onClick={() => onDelete(artist)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete Artist</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </td>
  </tr>
);

export default ArtistTableRow;
