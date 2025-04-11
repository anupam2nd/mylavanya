
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "lucide-react";
import WishlistSummary from "@/components/admin/wishlist/WishlistSummary";
import WishlistDemographicChart from "@/components/admin/wishlist/WishlistDemographicChart";
import WishlistPriceChart from "@/components/admin/wishlist/WishlistPriceChart";
import WishlistTable from "@/components/admin/wishlist/WishlistTable";

export interface WishlistInsight {
  id: number;
  service_id: number;
  service_name: string;
  service_price: number;
  service_category: string;
  count: number;
}

const AdminWishlistInsights = () => {
  const { user } = useAuth();
  const [wishlistData, setWishlistData] = useState<WishlistInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlistInsights = async () => {
      try {
        setLoading(true);
        
        // Get aggregated wishlist data
        const { data, error } = await supabase
          .from('wishlist')
          .select(`
            service_id,
            PriceMST!inner (
              ProductName,
              Price,
              Category
            )
          `)
          .order('service_id');
          
        if (error) throw error;
        
        // Process data to count occurrences and format for charts
        const serviceMap = new Map();
        
        data.forEach(item => {
          const serviceId = item.service_id;
          const serviceName = item.PriceMST.ProductName;
          const servicePrice = item.PriceMST.Price;
          const serviceCategory = item.PriceMST.Category;
          
          if (serviceMap.has(serviceId)) {
            const currentItem = serviceMap.get(serviceId);
            serviceMap.set(serviceId, {
              ...currentItem,
              count: currentItem.count + 1
            });
          } else {
            serviceMap.set(serviceId, {
              id: serviceMap.size + 1,
              service_id: serviceId,
              service_name: serviceName,
              service_price: servicePrice,
              service_category: serviceCategory,
              count: 1
            });
          }
        });
        
        setWishlistData(Array.from(serviceMap.values()));
      } catch (err) {
        console.error("Error fetching wishlist insights:", err);
        setError("Failed to load wishlist insights");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistInsights();
  }, []);

  // Only allow controller and superadmin to access this page
  if (user?.role !== 'controller' && user?.role !== 'superadmin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (loading) {
    return (
      <DashboardLayout title="Wishlist Insights">
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Loading wishlist insights...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Wishlist Insights">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Wishlist Insights">
      <div className="space-y-6">
        <WishlistSummary wishlistData={wishlistData} />
        
        <Tabs defaultValue="charts">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="table">Data Table</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <WishlistDemographicChart wishlistData={wishlistData} />
              <WishlistPriceChart wishlistData={wishlistData} />
            </div>
          </TabsContent>
          
          <TabsContent value="table">
            <WishlistTable wishlistData={wishlistData} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminWishlistInsights;
