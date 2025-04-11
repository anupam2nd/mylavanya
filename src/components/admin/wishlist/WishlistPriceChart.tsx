
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WishlistInsight } from "@/pages/admin/AdminWishlistInsights";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WishlistPriceChartProps {
  wishlistData: WishlistInsight[];
}

const WishlistPriceChart = ({ wishlistData }: WishlistPriceChartProps) => {
  // Sort data by count (popularity) for the chart
  const chartData = React.useMemo(() => {
    if (!wishlistData.length) return [];
    
    // Sort by popularity and take top 10
    return [...wishlistData]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => ({
        name: item.service_name.length > 15 
          ? `${item.service_name.substring(0, 15)}...` 
          : item.service_name,
        price: item.service_price,
        count: item.count,
        fullName: item.service_name // For tooltip
      }));
  }, [wishlistData]);

  // Return empty state if no data
  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Price Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center h-80 text-center">
          <p className="text-muted-foreground">No wishlist data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Price Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Price comparison of most popular wishlisted services
        </p>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer className="h-full w-full" config={{}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 80,
              }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                label={{ 
                  value: 'Price (₹)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'price') return [`₹${value}`, 'Price'];
                  return [value, name];
                }}
                labelFormatter={(label, items) => {
                  // Return the full service name in the tooltip
                  if (items && items.length > 0) {
                    const index = items[0].payload.fullName;
                    return index || label;
                  }
                  return label;
                }}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar 
                dataKey="price" 
                fill="#8884d8"
                name="Price"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default WishlistPriceChart;
