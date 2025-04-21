
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  TooltipProps,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface BookingDistribution {
  name: string;
  value: number;
  color: string;
}

const COLORS = [
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#ff8042", // Orange
  "#0088fe", // Blue
  "#00C49F", // Teal
  "#dc2626", // Red
];

export default function BookingDistributionChart() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BookingDistribution[]>([]);

  useEffect(() => {
    fetchBookingDistribution();
  }, []);

  const fetchBookingDistribution = async () => {
    setLoading(true);
    try {
      // First fetch all bookings with artist assignments
      const { data: bookingsWithArtists, error } = await supabase
        .from("BookMST")
        .select("ArtistId")
        .not("ArtistId", "is", null);

      if (error) throw error;

      // Now fetch artist categories
      const { data: artists, error: artistError } = await supabase
        .from("ArtistMST")
        .select("ArtistId, Artistgrp");

      if (artistError) throw artistError;

      // Create a map of artist IDs to groups
      const artistGroups = new Map();
      artists.forEach((artist) => {
        artistGroups.set(artist.ArtistId, artist.Artistgrp || "Uncategorized");
      });

      // Count bookings by artist group
      const bookingsByGroup: Record<string, number> = {};
      bookingsWithArtists.forEach((booking) => {
        const artistGroup = artistGroups.get(booking.ArtistId) || "Uncategorized";
        bookingsByGroup[artistGroup] = (bookingsByGroup[artistGroup] || 0) + 1;
      });

      // Create the data for the chart
      const chartData = Object.entries(bookingsByGroup)
        .map(([group, count], index) => ({
          name: group,
          value: count,
          color: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.value - a.value); // Sort by count descending

      setData(chartData);
    } catch (error) {
      console.error("Error fetching booking distribution:", error);
      toast({
        title: "Failed to load chart",
        description: "Could not retrieve booking distribution data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalBookings = data.value;
      const percentage = data.value / data.value;
      
      return (
        <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
          <div className="font-medium" style={{ color: data.color }}>{data.name}</div>
          <div className="grid gap-1.5">
            <div className="flex w-full flex-wrap items-stretch gap-2 items-center">
              <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: data.color }} />
              <div className="flex flex-1 justify-between items-center leading-none">
                <span className="text-muted-foreground">Bookings</span>
                <span className="font-mono font-medium tabular-nums text-foreground">{totalBookings}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : data.length > 0 ? (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              innerRadius={60}
              outerRadius={120}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        ) : (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            No booking data available
          </div>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
}
