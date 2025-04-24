
// Only the fetchBookings function where the issue exists
useEffect(() => {
  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("Fetching all bookings for coordinator");
      const { data, error } = await supabase
        .from('BookMST')
        .select('*')
        .order('Booking_date', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }
      
      console.log("Bookings fetched:", data?.length || 0);
      
      // Transform data to ensure Booking_NO is always a string
      const transformedData = data?.map(booking => ({
        ...booking,
        Booking_NO: booking.Booking_NO?.toString() || ''
      })) as Booking[];
      
      setBookings(transformedData || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Failed to load bookings",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  fetchBookings();
}, [toast]);
