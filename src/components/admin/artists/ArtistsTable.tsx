import { Edit, Trash2, Eye } from "lucide-react";
import { Artist } from "@/types/artist";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ArtistsTableProps {
  artists: Artist[];
  onEdit: (artist: Artist) => void;
  onDelete: (artist: Artist) => void;
  onToggleStatus: (artist: Artist) => void;
  onViewActivity: (artist: Artist) => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: 'ascending' | 'descending' };
}

const ArtistsTable = ({
  artists,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewActivity,
  onSort,
  sortConfig
}: ArtistsTableProps) => {
  // Render sort indicator
  const renderSortIndicator = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };
  
  // Handle column header click for sorting
  const handleHeaderClick = (columnKey: string) => {
    onSort(columnKey);
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleHeaderClick('ArtistFirstName')}
            >
              Name {renderSortIndicator('ArtistFirstName')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleHeaderClick('emailid')}
            >
              Email {renderSortIndicator('emailid')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleHeaderClick('ArtistPhno')}
            >
              Phone {renderSortIndicator('ArtistPhno')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleHeaderClick('Artistgrp')}
            >
              Category {renderSortIndicator('Artistgrp')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleHeaderClick('ArtistRating')}
            >
              Rating {renderSortIndicator('ArtistRating')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleHeaderClick('created_at')}
            >
              Join Date {renderSortIndicator('created_at')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleHeaderClick('Active')}
            >
              Status {renderSortIndicator('Active')}
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artists.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No artists found. Try changing your search criteria.
              </TableCell>
            </TableRow>
          )}
          {artists.map((artist) => (
            <TableRow key={artist.ArtistId} className="group">
              <TableCell className="font-medium">
                {artist.ArtistFirstName} {artist.ArtistLastName}
                {artist.ArtistEmpCode && (
                  <div className="text-xs text-muted-foreground">{artist.ArtistEmpCode}</div>
                )}
              </TableCell>
              <TableCell>{artist.emailid || 'N/A'}</TableCell>
              <TableCell>{artist.ArtistPhno || 'N/A'}</TableCell>
              <TableCell>
                {artist.Artistgrp ? (
                  <Badge variant="outline">{artist.Artistgrp}</Badge>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                {artist.created_at ? new Date(artist.created_at).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={artist.Active === true} 
                    onCheckedChange={() => onToggleStatus(artist)}
                  />
                  <StatusBadge status={artist.Active ? "approve" : "cancel"}>
                    {artist.Active ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>
              </TableCell>
              <TableCell className="text-right space-x-1">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ArtistsTable;
