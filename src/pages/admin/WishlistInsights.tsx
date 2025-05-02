
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";
import { WishlistInsightsTable } from "@/components/admin/wishlist/WishlistInsightsTable";

interface WishlistInsight {
  id: number;
  service_id: number;
  user_id: string;
  created_at: string;
  product_name: string;
  product_price: number;
  product_created_at: string;
  customer_name: string;
}

const WishlistInsights = () => {
  const [wishlistData, setWishlistData] = useState<WishlistInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlistInsights = async () => {
      try {
        setLoading(true);
        
        // Join wishlist table with PriceMST and MemberMST to get the required data
        const { data, error } = await supabase
          .from('wishlist')
          .select(`
            id,
            service_id,
            user_id,
            created_at,
            PriceMST!inner(
              ProductName,
              Price,
              created_at
            )
          `);

        if (error) {
          console.error("Error fetching wishlist insights:", error);
          setError("Failed to load wishlist data. Please try again later.");
          return;
        }

        // Now we need to fetch customer names from MemberMST based on user_id
        const formattedData: WishlistInsight[] = [];
        
        // Process the data to get member names
        for (const item of data) {
          // Fetch member info
          const { data: memberData, error: memberError } = await supabase
            .from('MemberMST')
            .select('MemberFirstName, MemberLastName')
            .eq('uuid', item.user_id)
            .maybeSingle();
          
          if (memberError) {
            console.error("Error fetching member data:", memberError);
          }

          // Format the data for display
          const customerName = memberData 
            ? `${memberData.MemberFirstName || ''} ${memberData.MemberLastName || ''}`.trim() 
            : 'Unknown';
          
          formattedData.push({
            id: item.id,
            service_id: item.service_id,
            user_id: item.user_id,
            created_at: item.created_at,
            product_name: item.PriceMST.ProductName || 'N/A',
            product_price: item.PriceMST.Price || 0,
            product_created_at: item.PriceMST.created_at || 'N/A',
            customer_name: customerName
          });
        }
        
        setWishlistData(formattedData);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistInsights();
  }, []);

  // Define column headers for CSV export
  const exportHeaders = {
    product_name: 'Product Name',
    product_price: 'Price',
    product_created_at: 'Product Created Date',
    customer_name: 'Customer Name',
    created_at: 'Added to Wishlist Date'
  };

  return (
    <DashboardLayout title="Wishlist Insights">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer Wishlists</CardTitle>
          <ExportButton
            data={wishlistData}
            filename="wishlist-insights"
            headers={exportHeaders}
            buttonText="Export Wishlist Data"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="mr-2 h-6 w-6 animate-spin" />
              <p>Loading wishlist insights...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : wishlistData.length === 0 ? (
            <div className="py-10 text-center">
              <p>No wishlist data available.</p>
            </div>
          ) : (
            <WishlistInsightsTable data={wishlistData} />
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default WishlistInsights;
