
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface WishlistProductChartProps {
  data: ChartData[];
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const WishlistProductChart = ({ data, height = 300 }: WishlistProductChartProps) => {
  const renderLabel = ({ name, percent }: { name: string; percent: number }) => {
    return `${(percent * 100).toFixed(0)}%`;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No wishlist data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value} items (${((value as number) / data.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1)}%)`, name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default WishlistProductChart;
