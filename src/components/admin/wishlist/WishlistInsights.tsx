
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportButton } from "@/components/ui/export-button";
import { useToast } from "@/hooks/use-toast";

interface WishlistInsightItem {
  id: number;
  product_id: number;
  product_name: string;
  customer_name: string;
  price: number;
  created_at: string;
  wishlist_count: number;
}

export const WishlistInsights = () => {
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistInsightItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchWishlistInsights();
  }, []);

  const fetchWishlistInsights = async () => {
    try {
      setLoading(true);
      
      // Query that joins wishlist with PriceMST and gets counts
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          service_id,
          PriceMST!inner(
            prod_id,
            ProductName,
            Price,
            created_at
          ),
          user_id
        `);

      if (error) {
        console.error("Error fetching wishlist insights:", error);
        toast({
          title: "Error",
          description: "Failed to load wishlist insights",
          variant: "destructive"
        });
        return;
      }

      // Process data to count occurrences of each product and format it
      const productMap = new Map<number, WishlistInsightItem>();
      
      for (const item of data) {
        const productId = item.PriceMST.prod_id;
        
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            id: productId,
            product_id: productId,
            product_name: item.PriceMST.ProductName,
            customer_name: item.user_id, // Will be replaced with actual name when available
            price: item.PriceMST.Price,
            created_at: item.PriceMST.created_at,
            wishlist_count: 1
          });
        } else {
          const existing = productMap.get(productId)!;
          existing.wishlist_count += 1;
        }
      }
      
      // Convert map to array
      const wishlistInsights = Array.from(productMap.values());
      
      // Try to get customer names where possible
      for (const item of wishlistInsights) {
        try {
          // Get user details from UserMST based on user_id
          const { data: userData } = await supabase
            .from('UserMST')
            .select('FirstName, LastName')
            .eq('Username', item.customer_name)
            .single();
            
          if (userData) {
            item.customer_name = `${userData.FirstName || ''} ${userData.LastName || ''}`.trim();
          }
        } catch (error) {
          console.log("Could not fetch user details for:", item.customer_name);
        }
      }
      
      setWishlistItems(wishlistInsights);
    } catch (error) {
      console.error("Unexpected error in fetchWishlistInsights:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search term
  const filteredItems = wishlistItems.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare data for export
  const exportData = filteredItems.map((item) => ({
    Product_ID: item.product_id,
    Product_Name: item.product_name,
    Customer_Name: item.customer_name,
    Price: item.price,
    Created_At: new Date(item.created_at).toLocaleDateString(),
    Wishlist_Count: item.wishlist_count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wishlist Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <ExportButton
            data={exportData}
            filename="wishlist-insights"
            headers={{
              Product_ID: "Product ID",
              Product_Name: "Product Name",
              Customer_Name: "Customer Name",
              Price: "Price (₹)",
              Created_At: "Product Created At",
              Wishlist_Count: "Wishlist Count"
            }}
            buttonText="Export Insights"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading insights...</span>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Wishlist Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell>{item.price.toFixed(2)}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{item.wishlist_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No wishlist items found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
