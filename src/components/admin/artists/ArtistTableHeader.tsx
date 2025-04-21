
import { TableHead, TableRow } from "@/components/ui/table";

interface ArtistTableHeaderProps {
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "ascending" | "descending" };
}

const headers = [
  { label: "Name", key: "ArtistFirstName" },
  { label: "Email", key: "emailid" },
  { label: "Phone", key: "ArtistPhno" },
  { label: "Rating", key: "ArtistRating" },
  { label: "Join Date", key: "created_at" },
  { label: "Status", key: "Active" },
];

const renderSortIndicator = (active: boolean, direction: "ascending" | "descending") => {
  if (!active) return null;
  return direction === "ascending" ? "↑" : "↓";
};

const ArtistTableHeader = ({
  onSort,
  sortConfig,
}: ArtistTableHeaderProps) => (
  <TableRow>
    {headers.map((header) => (
      <TableHead
        className="cursor-pointer"
        key={header.key}
        onClick={() => onSort(header.key)}
      >
        {header.label} {renderSortIndicator(sortConfig.key === header.key, sortConfig.direction)}
      </TableHead>
    ))}
    <TableHead className="text-right">Actions</TableHead>
  </TableRow>
);

export default ArtistTableHeader;
