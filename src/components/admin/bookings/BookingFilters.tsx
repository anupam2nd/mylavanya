
import { SearchFilter } from "./filters/SearchFilter";
import { StatusFilter } from "./filters/StatusFilter";
import { ArtistFilter } from "./filters/ArtistFilter";
import { DateFilter } from "./filters/DateFilter";
import { SortFilter } from "./filters/SortFilter";
import { ClearFiltersButton } from "./filters/ClearFiltersButton";
import { FilterDateType, SortDirection, SortField } from "@/hooks/useBookingFilters";

interface BookingFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  clearFilters: () => void;
  statusOptions: { value: string; label: string }[];
  showDateFilter: boolean;
  setShowDateFilter: (show: boolean) => void;
  filterDateType: FilterDateType;
  setFilterDateType: (type: FilterDateType) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  artistFilter?: string;
  setArtistFilter?: (value: string) => void;
  artistOptions?: Array<{ value: string; label: string; empCode: string }>;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  statusFilter,
  setStatusFilter,
  clearFilters,
  statusOptions,
  showDateFilter,
  setShowDateFilter,
  filterDateType,
  setFilterDateType,
  sortDirection,
  setSortDirection,
  sortField,
  setSortField,
  artistFilter = "all",
  setArtistFilter,
  artistOptions = []
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-end">
      <SearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <StatusFilter
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusOptions={statusOptions}
      />

      {setArtistFilter && (
        <ArtistFilter
          artistFilter={artistFilter}
          setArtistFilter={setArtistFilter}
          artistOptions={artistOptions}
        />
      )}

      <DateFilter
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        showDateFilter={showDateFilter}
        filterDateType={filterDateType}
        setFilterDateType={setFilterDateType}
      />

      <SortFilter
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        sortField={sortField}
        setSortField={setSortField}
      />

      <ClearFiltersButton
        startDate={startDate}
        endDate={endDate}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        artistFilter={artistFilter}
        clearFilters={clearFilters}
      />
    </div>
  );
};

export default BookingFilters;
