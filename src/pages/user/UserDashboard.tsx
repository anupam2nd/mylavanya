
// Only the fetchBookings function where the issue exists
useEffect(() => {
  const fetchBookings = async () => {
    if (!user) {
      console.log("No user found in context, skipping fetch");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to fetch bookings for user: ${user.email}`);
      
      const { data, error } = await supabase
        .from('BookMST')
        .select('*');
      
      if (error) {
        console.error('Error fetching all bookings:', error);
        setError("Failed to load bookings data");
        toast.error("Failed to load bookings data");
        return;
      }
      
      console.log(`Total bookings in system: ${data?.length || 0}`);
      
      // Filter to only show the current user's bookings and transform Booking_NO to string
      const userBookings = data?.filter(booking => booking.email === user.email)
        .map(booking => ({
          ...booking,
          Booking_NO: booking.Booking_NO?.toString() || ''
        })) || [];
        
      console.log(`User bookings found: ${userBookings.length}`);
      
      if (userBookings.length > 0) {
        console.log("Sample booking:", JSON.stringify(userBookings[0]));
      } else {
        console.log("No bookings found for the current user");
      }
      
      setBookings(userBookings);
    } catch (error) {
      console.error('Unexpected error in fetch:', error);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };
  
  fetchBookings();
}, [user]);
