
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WishlistInsight } from "@/pages/admin/AdminWishlistInsights";
import { Heart, Package, Users, ArrowUpRight } from "lucide-react";

interface WishlistSummaryProps {
  wishlistData: WishlistInsight[];
}

const WishlistSummary = ({ wishlistData }: WishlistSummaryProps) => {
  // Calculate summary statistics
  const totalWishlists = wishlistData.reduce((sum, item) => sum + item.count, 0);
  const uniqueServices = wishlistData.length;
  const mostWishlisted = wishlistData.length > 0 
    ? wishlistData.sort((a, b) => b.count - a.count)[0]
    : null;
    
  const avgPrice = wishlistData.length > 0 
    ? Math.round(wishlistData.reduce((sum, item) => sum + item.service_price, 0) / uniqueServices)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Wishlist Entries</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWishlists}</div>
          <p className="text-xs text-muted-foreground">
            Across all users
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Services</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueServices}</div>
          <p className="text-xs text-muted-foreground">
            Different services wishlisted
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate" title={mostWishlisted?.service_name || 'None'}>
            {mostWishlisted ? (mostWishlisted.service_name.length > 15 
              ? `${mostWishlisted.service_name.substring(0, 15)}...` 
              : mostWishlisted.service_name) 
            : 'None'}
          </div>
          <p className="text-xs text-muted-foreground">
            {mostWishlisted ? `${mostWishlisted.count} users` : 'No data'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{avgPrice}</div>
          <p className="text-xs text-muted-foreground">
            Average service price
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistSummary;
