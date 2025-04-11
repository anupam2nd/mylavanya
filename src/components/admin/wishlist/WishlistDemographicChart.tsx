
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WishlistInsight } from "@/pages/admin/AdminWishlistInsights";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Loader } from "lucide-react";

interface WishlistDemographicChartProps {
  wishlistData: WishlistInsight[];
}

// Custom colors for the pie chart
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

const WishlistDemographicChart = ({ wishlistData }: WishlistDemographicChartProps) => {
  // Format data for pie chart based on service categories
  const chartData = React.useMemo(() => {
    if (!wishlistData.length) return [];
    
    const categoryMap = new Map<string, number>();
    
    wishlistData.forEach(item => {
      const category = item.service_category || "Uncategorized";
      
      if (categoryMap.has(category)) {
        categoryMap.set(category, categoryMap.get(category)! + item.count);
      } else {
        categoryMap.set(category, item.count);
      }
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, [wishlistData]);

  // Return empty state if no data
  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wishlist by Category</CardTitle>
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
        <CardTitle>Wishlist by Category</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribution of wishlist entries by service category
        </p>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer 
          className="h-full w-full"
          config={{}}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} items`, 'Count']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default WishlistDemographicChart;
