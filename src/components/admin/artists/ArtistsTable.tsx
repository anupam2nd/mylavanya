
import { Edit, Trash2 } from "lucide-react";
import { Artist } from "@/types/artist";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface ArtistsTableProps {
  artists: Artist[];
  isSuperAdmin: boolean;
  onEdit: (artist: Artist) => void;
  onDelete: (artist: Artist) => void;
  onToggleStatus: (artist: Artist) => void;
}

export const ArtistsTable = ({
  artists,
  isSuperAdmin,
  onEdit,
  onDelete,
  onToggleStatus
}: ArtistsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Employee Code</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artists.map((artist) => (
            <TableRow key={artist.ArtistId}>
              <TableCell className="font-medium">
                {artist.ArtistFirstName} {artist.ArtistLastName}
              </TableCell>
              <TableCell>{artist.ArtistEmpCode}</TableCell>
              <TableCell>{artist.ArtistPhno}</TableCell>
              <TableCell>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {artist.Artistgrp || 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                {artist.ArtistRating !== null ? `${artist.ArtistRating}/5` : 'N/A'}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={artist.Active === true} 
                    onCheckedChange={() => onToggleStatus(artist)}
                  />
                  <span className={artist.Active ? "text-green-600" : "text-red-600"}>
                    {artist.Active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(artist)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                
                {isSuperAdmin && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDelete(artist)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
