
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rupee } from "@/components/icons/Rupee";
import { Heart, Trash2, CalendarPlus, Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  if (loading) {
    return (
      <DashboardLayout title="Wishlist">
        <div className="flex justify-center items-center h-64">
          <Loader className="h-6 w-6 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (wishlistItems.length === 0) {
    return (
      <DashboardLayout title="Wishlist">
        <Card>
          <CardHeader>
            <CardTitle>Your Wishlist</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Browse our services and add items to your wishlist for easy access later.
            </p>
            <Button onClick={() => navigate('/services')} className="mt-2">
              Browse Services
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Wishlist">
      <Card>
        <CardHeader>
          <CardTitle>Your Wishlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row justify-between border rounded-lg p-4">
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{item.service_name}</h3>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                    {item.service_description || "No description available"}
                  </p>
                  <div className="mt-2 flex items-center text-primary-foreground">
                    {item.service_category && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {item.service_category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:items-end justify-between mt-4 md:mt-0 gap-2">
                  <div className="flex items-center">
                    <Rupee className="h-4 w-4 mr-0.5" />
                    <span className="text-lg font-bold">{item.service_price || "Price on request"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeFromWishlist(item.id)}
                      className="flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/services/${item.service_id}`)}
                      className="flex items-center"
                    >
                      <CalendarPlus className="h-4 w-4 mr-1" />
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Wishlist;
