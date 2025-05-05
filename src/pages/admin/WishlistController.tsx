import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Heart, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ExportButton } from "@/components/ui/export-button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface WishlistItem {
  id: number;
  service_id: number;
  user_id: string;
  created_at: string;
  service_name: string;
  service_price: number;
  service_category: string;
  customer_name: string;
  product_created_at: string;
  customer_email?: string;
}

interface ExportItem {
  product_created_at: string;
  service_name: string;
  customer_name: string;
  service_price: number;
}

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const WishlistController = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalWishlists, setTotalWishlists] = useState(0);

  useEffect(() => {
    const fetchAllWishlist = async () => {
      try {
        setLoading(true);
        console.log("Fetching all wishlist items");
        
        // Query to join wishlist with PriceMST and MemberMST tables
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
        const enhancedData = await Promise.all(
          data.map(async (item) => {
            // Try to get member information from MemberMST
            const { data: memberData } = await supabase
              .from('MemberMST')
              .select('MemberFirstName, MemberLastName, MemberEmailId')
              .eq('MemberEmailId', item.user_id)
              .single();

            // If member found, use their name
            if (memberData) {
              return {
                id: item.id,
                service_id: item.service_id,
                user_id: item.user_id,
                created_at: item.created_at,
                service_name: item.PriceMST.ProductName,
                service_price: item.PriceMST.Price,
                service_category: item.PriceMST.Category,
                product_created_at: item.PriceMST.created_at,
                customer_name: `${memberData.MemberFirstName || ''} ${memberData.MemberLastName || ''}`.trim() || 'Unknown',
                customer_email: memberData.MemberEmailId
              };
            } else {
              // If no member found, try to get user information from UserMST
              const { data: userData } = await supabase
                .from('UserMST')
                .select('FirstName, LastName, email')
                .eq('uuid', item.user_id)
                .single();
                
              if (userData) {
                return {
                  id: item.id,
                  service_id: item.service_id,
                  user_id: item.user_id,
                  created_at: item.created_at,
                  service_name: item.PriceMST.ProductName,
                  service_price: item.PriceMST.Price,
                  service_category: item.PriceMST.Category,
                  product_created_at: item.PriceMST.created_at,
                  customer_name: `${userData.FirstName || ''} ${userData.LastName || ''}`.trim() || 'Unknown',
                  customer_email: userData.email
                };
              } else {
                // If still no user found, return with unknown customer name but keep the email
                return {
                  id: item.id,
                  service_id: item.service_id,
                  user_id: item.user_id,
                  created_at: item.created_at,
                  service_name: item.PriceMST.ProductName,
                  service_price: item.PriceMST.Price,
                  service_category: item.PriceMST.Category,
                  product_created_at: item.PriceMST.created_at,
                  customer_name: item.user_id.includes('@') ? item.user_id : 'Unknown',
                  customer_email: item.user_id.includes('@') ? item.user_id : undefined
                };
              }
            }
          })
        );
        
        console.log("Wishlist data processed:", enhancedData);
        setWishlistItems(enhancedData);
        setTotalWishlists(enhancedData.length);
        
        // Prepare chart data - group by product name and count occurrences
        const productCounts: Record<string, number> = {};
        enhancedData.forEach(item => {
          if (productCounts[item.service_name]) {
            productCounts[item.service_name]++;
          } else {
            productCounts[item.service_name] = 1;
          }
        });
        
        // Convert to chart data format
        const chartDataArray = Object.entries(productCounts).map(([name, count]) => ({
          name,
          value: count
        }));
        
        setChartData(chartDataArray);
        
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
  
  // Prepare data for export
  const exportData: ExportItem[] = wishlistItems.map(item => ({
    product_created_at: item.product_created_at ? format(new Date(item.product_created_at), 'yyyy-MM-dd') : 'Unknown',
    service_name: item.service_name,
    customer_name: item.customer_name,
    service_price: item.service_price
  }));

  // Define headers for the CSV export
  const exportHeaders = {
    product_created_at: 'Product Created At',
    service_name: 'Product Name',
    customer_name: 'Customer Name',
    service_price: 'Price'
  };

  const renderLabel = ({ name, value, percent }: { name: string; value: number; percent: number }) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin', 'controller']}>
      <DashboardLayout title="Customer Wishlist Details">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Total Wishlist Items Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Wishlist Items</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWishlists}</div>
              <p className="text-xs text-muted-foreground">
                Total items saved by customers
              </p>
            </CardContent>
          </Card>
          
          {/* Demographic Chart Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Product Popularity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No wishlist data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      
        <Card className="mt-4">
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
                      <TableCell className="font-medium">
                        {item.customer_name && item.customer_name !== 'Unknown' 
                          ? item.customer_name 
                          : (item.customer_email || 'Unknown')}
                      </TableCell>
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
