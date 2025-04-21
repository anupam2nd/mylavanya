
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ArtistRegistrationChart from "./ArtistRegistrationChart";
import BookingDistributionChart from "./BookingDistributionChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ArtistRegistration {
  date: string;
  count: number;
}

interface ArtistAnalyticsData {
  totalArtists: number;
  activeArtists: number;
  totalBookings: number;
  newArtistsThisMonth: number;
  registrationData: Array<{
    formattedDate: string;
    count: number;
    previousPeriodCount?: number;
  }>;
}

export default function ArtistAnalytics() {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<ArtistAnalyticsData>({
    totalArtists: 0,
    activeArtists: 0,
    totalBookings: 0,
    newArtistsThisMonth: 0,
    registrationData: []
  });
  const [timeframe, setTimeframe] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch total artists count
      const { count: totalArtists, error: countError } = await supabase
        .from('ArtistMST')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;

      // Fetch active artists count
      const { count: activeArtistsCount, error: activeError } = await supabase
        .from('ArtistMST')
        .select('*', { count: 'exact', head: true })
        .eq('Active', true);
      
      if (activeError) throw activeError;

      // Fetch total bookings count with artists assigned
      const { count: totalBookingsCount, error: bookingsError } = await supabase
        .from('BookMST')
        .select('*', { count: 'exact', head: true })
        .not('ArtistId', 'is', null);
      
      if (bookingsError) throw bookingsError;

      // Get current date
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Fetch new artists this month
      const { count: newArtistsCount, error: newArtistsError } = await supabase
        .from('ArtistMST')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());
      
      if (newArtistsError) throw newArtistsError;

      // Fetch artist registration data based on timeframe
      let startDate = new Date();
      let previousPeriodStart = new Date();
      let previousPeriodEnd = new Date();
      let interval = '1 day';
      
      if (timeframe === 'week') {
        // Last 7 days
        startDate.setDate(startDate.getDate() - 7);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 7);
        interval = '1 day';
      } else if (timeframe === 'month') {
        // Last 30 days
        startDate.setDate(startDate.getDate() - 30);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 30);
        interval = '1 day';
      } else if (timeframe === 'quarter') {
        // Last 90 days
        startDate.setDate(startDate.getDate() - 90);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 180);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 90);
        interval = '1 week';
      } else if (timeframe === 'year') {
        // Last 365 days
        startDate.setDate(startDate.getDate() - 365);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 730);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 365);
        interval = '1 month';
      }

      // Get raw registration data
      const { data: registrationData, error: registrationError } = await supabase
        .from('ArtistMST')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (registrationError) throw registrationError;

      // Get previous period data
      const { data: previousPeriodData, error: previousPeriodError } = await supabase
        .from('ArtistMST')
        .select('created_at')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', previousPeriodEnd.toISOString())
        .order('created_at', { ascending: true });
      
      if (previousPeriodError) throw previousPeriodError;

      // Process the data for charting
      const processedData = processRegistrationData(
        registrationData || [], 
        previousPeriodData || [],
        startDate,
        timeframe
      );

      setAnalyticsData({
        totalArtists: totalArtists || 0,
        activeArtists: activeArtistsCount || 0,
        totalBookings: totalBookingsCount || 0,
        newArtistsThisMonth: newArtistsCount || 0,
        registrationData: processedData
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Failed to load analytics",
        description: "Could not retrieve artist analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processRegistrationData = (
    currentData: Array<{ created_at: string }>,
    previousData: Array<{ created_at: string }>,
    startDate: Date,
    timeframe: string
  ) => {
    // Format dates and count daily registrations
    const dailyCounts: Record<string, number> = {};
    const previousPeriodCounts: Record<string, number> = {};
    
    // Initialize date range based on timeframe
    let dateFormat: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    let dateIncrement = 1;
    let dateIncrementUnit: 'day' | 'week' | 'month' = 'day';
    
    if (timeframe === 'week' || timeframe === 'month') {
      dateFormat = { year: 'numeric', month: 'short', day: 'numeric' };
      dateIncrement = 1;
      dateIncrementUnit = 'day';
    } else if (timeframe === 'quarter') {
      dateFormat = { year: 'numeric', month: 'short', day: 'numeric' };
      dateIncrement = 7;
      dateIncrementUnit = 'day';
    } else if (timeframe === 'year') {
      dateFormat = { year: 'numeric', month: 'short' };
      dateIncrement = 1;
      dateIncrementUnit = 'month';
    }
    
    // Generate all dates in range for the x-axis
    const dates = [];
    const currentEnd = new Date();
    let current = new Date(startDate);
    
    while (current <= currentEnd) {
      const formattedDate = current.toLocaleDateString('en-US', dateFormat);
      dates.push(formattedDate);
      dailyCounts[formattedDate] = 0;
      
      // Move to next time period
      if (dateIncrementUnit === 'day') {
        current.setDate(current.getDate() + dateIncrement);
      } else if (dateIncrementUnit === 'month') {
        current.setMonth(current.getMonth() + dateIncrement);
      }
    }
    
    // Count current period registrations
    currentData.forEach(item => {
      const date = new Date(item.created_at);
      const formattedDate = date.toLocaleDateString('en-US', dateFormat);
      dailyCounts[formattedDate] = (dailyCounts[formattedDate] || 0) + 1;
    });
    
    // Create a mapping of previous period dates to current period dates
    const previousToCurrent = {} as Record<string, string>;
    const now = new Date();
    const periodLength = (now.getTime() - startDate.getTime());
    
    // Count previous period registrations and map to current period for comparison
    previousData.forEach(item => {
      const prevDate = new Date(item.created_at);
      const prevFormattedDate = prevDate.toLocaleDateString('en-US', dateFormat);
      
      // Calculate the equivalent date in the current period
      const daysFromPrevPeriodStart = (prevDate.getTime() - startDate.getTime() + periodLength) / (24 * 60 * 60 * 1000);
      const equivalentCurrentDate = new Date(startDate.getTime() + (daysFromPrevPeriodStart * 24 * 60 * 60 * 1000));
      const currentFormattedDate = equivalentCurrentDate.toLocaleDateString('en-US', dateFormat);
      
      previousToCurrent[prevFormattedDate] = currentFormattedDate;
      previousPeriodCounts[currentFormattedDate] = (previousPeriodCounts[currentFormattedDate] || 0) + 1;
    });
    
    // Combine the data
    return dates.map(date => ({
      formattedDate: date,
      count: dailyCounts[date] || 0,
      previousPeriodCount: previousPeriodCounts[date] || 0
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <h2 className="text-2xl font-bold">Artist Analytics</h2>
        <div className="flex justify-end">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="quarter">Past Quarter</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalArtists}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.newArtistsThisMonth} new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Artists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeArtists}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.totalArtists > 0 
                ? Math.round((analyticsData.activeArtists / analyticsData.totalArtists) * 100) 
                : 0}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Assigned to artists
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Bookings per Artist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.activeArtists > 0 
                ? (analyticsData.totalBookings / analyticsData.activeArtists).toFixed(1) 
                : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              For active artists
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registrations" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="registrations">Artist Registration</TabsTrigger>
          <TabsTrigger value="distribution">Booking Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="registrations" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>New Artist Registration Rate</CardTitle>
              <CardDescription>
                {timeframe === 'week' && 'Daily new artists over the past week vs. previous week'}
                {timeframe === 'month' && 'Daily new artists over the past month vs. previous month'}
                {timeframe === 'quarter' && 'Weekly new artists over the past quarter vs. previous quarter'}
                {timeframe === 'year' && 'Monthly new artists over the past year vs. previous year'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-[350px]">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="h-[350px]">
                  <ArtistRegistrationChart data={analyticsData.registrationData} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Distribution by Artist Category</CardTitle>
              <CardDescription>
                Distribution of bookings across different artist categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-[350px]">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="h-[350px]">
                  <BookingDistributionChart />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
