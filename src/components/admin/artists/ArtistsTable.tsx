
import { Table, TableBody, TableCell, TableHeader } from "@/components/ui/table";
import { Artist } from "@/types/artist";
import ArtistTableHeader from "./ArtistTableHeader";
import ArtistTableRow from "./ArtistTableRow";

interface ArtistsTableProps {
  artists: Artist[];
  onEdit: (artist: Artist) => void;
  onDelete: (artist: Artist) => void;
  onToggleStatus: (artist: Artist) => void;
  onViewActivity: (artist: Artist) => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: 'ascending' | 'descending' };
  isSuperAdmin?: boolean;
}

const ArtistsTable = ({
  artists,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewActivity,
  onSort,
  sortConfig,
  isSuperAdmin = true,
}: ArtistsTableProps) => (
  <div className="w-full overflow-auto">
    <Table>
      <TableHeader>
        <ArtistTableHeader onSort={onSort} sortConfig={sortConfig} />
      </TableHeader>
      <TableBody>
        {artists.length === 0 ? (
          <tr>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No artists found. Try changing your search criteria.
            </TableCell>
          </tr>
        ) : (
          artists.map((artist) => (
            <ArtistTableRow
              key={artist.ArtistId}
              artist={artist}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onViewActivity={onViewActivity}
              isSuperAdmin={isSuperAdmin}
            />
          ))
        )}
      </TableBody>
    </Table>
  </div>
);

export default ArtistsTable;
