
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ExportButton } from "@/components/ui/export-button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { format } from "date-fns";

interface WishlistItem {
  id: number;
  service_id: number;
  user_id: string;  // UUID string
  created_at: string;
  service_name: string;
  service_price: number;
  service_category: string;
  product_created_at: string;
  customer_name: string;
}

interface ExportItem {
  product_created_at: string;
  service_name: string;
  customer_name: string;
  service_price: number;
}

const WishlistController = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllWishlist = async () => {
      try {
        setLoading(true);
        console.log("Fetching all wishlist items");
        
        // Query to join wishlist with PriceMST tables
        const { data, error } = await supabase
          .from('wishlist')
          .select(`
            id,
            user_id,
            service_id,
            created_at,
            PriceMST!inner(
              prod_id,
              ProductName,
              Price,
              Category,
              created_at
            )
          `);

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        // Fetch user information for each wishlist item
        const enhancedData: WishlistItem[] = await Promise.all(
          data.map(async (item) => {
            // Query MemberMST with UUID user_id
            const { data: memberData } = await supabase
              .from('MemberMST')
              .select('MemberFirstName, MemberLastName, MemberEmailId')
              .eq('uuid', String(item.user_id)); // Convert to string for UUID comparison

            // If member found, use their name
            if (memberData && memberData.length > 0) {
              const member = memberData[0];
              return {
                id: item.id,
                service_id: item.service_id,
                user_id: String(item.user_id), // Convert to string for consistency
                created_at: item.created_at,
                service_name: item.PriceMST.ProductName,
                service_price: item.PriceMST.Price,
                service_category: item.PriceMST.Category,
                product_created_at: item.PriceMST.created_at,
                customer_name: `${member.MemberFirstName || ''} ${member.MemberLastName || ''}`.trim() || 'Unknown'
              };
            } else {
              // If no member found, return with unknown customer name
              return {
                id: item.id,
                service_id: item.service_id,
                user_id: String(item.user_id), // Convert to string for consistency
                created_at: item.created_at,
                service_name: item.PriceMST.ProductName,
                service_price: item.PriceMST.Price,
                service_category: item.PriceMST.Category,
                product_created_at: item.PriceMST.created_at,
                customer_name: 'Unknown'
              };
            }
          })
        );
        
        console.log("Wishlist data processed:", enhancedData);
        setWishlistItems(enhancedData);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to load wishlist data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllWishlist();
  }, []);
  
  const exportData: ExportItem[] = wishlistItems.map(item => ({
    product_created_at: item.product_created_at ? format(new Date(item.product_created_at), 'yyyy-MM-dd') : 'Unknown',
    service_name: item.service_name,
    customer_name: item.customer_name,
    service_price: item.service_price
  }));

  const exportHeaders = {
    product_created_at: 'Product Created At',
    service_name: 'Product Name',
    customer_name: 'Customer Name',
    service_price: 'Price'
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin', 'controller']}>
      <DashboardLayout title="Wishlist Controller">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Customer Wishlists</CardTitle>
            <ExportButton
              data={exportData}
              filename="wishlist-data"
              headers={exportHeaders}
              buttonText="Export Wishlist Data"
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground ml-2">Loading wishlist data...</p>
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No wishlist items found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  There are currently no items in any customer wishlists.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead>Product Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wishlistItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.customer_name}</TableCell>
                      <TableCell>{item.service_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.service_category || 'Uncategorized'}</Badge>
                      </TableCell>
                      <TableCell>₹{item.service_price.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(item.created_at), 'dd MMM yyyy')}</TableCell>
                      <TableCell>
                        {item.product_created_at ? format(new Date(item.product_created_at), 'dd MMM yyyy') : 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default WishlistController;
