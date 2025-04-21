
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface RegistrationDataPoint {
  formattedDate: string;
  count: number;
  previousPeriodCount?: number;
}

interface ArtistRegistrationChartProps {
  data: RegistrationDataPoint[];
}

const ArtistRegistrationChart = ({ data }: ArtistRegistrationChartProps) => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const currentCount = payload[0].value as number;
      const previousCount = payload[1]?.value as number | undefined;
      const percentChange = previousCount !== undefined && previousCount !== 0
        ? ((currentCount - previousCount) / previousCount * 100).toFixed(1)
        : undefined;
      
      return (
        <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
          <div className="font-medium">{label as string}</div>
          <div className="grid gap-1.5">
            <div className="flex w-full flex-wrap items-stretch gap-2 items-center">
              <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: "var(--color-current)" }} />
              <div className="flex flex-1 justify-between items-center leading-none">
                <span className="text-muted-foreground">Current Period</span>
                <span className="font-mono font-medium tabular-nums text-foreground">{currentCount}</span>
              </div>
            </div>
            {previousCount !== undefined && (
              <div className="flex w-full flex-wrap items-stretch gap-2 items-center">
                <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: "var(--color-previous)" }} />
                <div className="flex flex-1 justify-between items-center leading-none">
                  <span className="text-muted-foreground">Previous Period</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">{previousCount}</span>
                </div>
              </div>
            )}
            {percentChange !== undefined && (
              <div className="flex w-full flex-wrap items-stretch gap-2 items-center">
                <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: "var(--color-current)" }} />
                <div className="flex flex-1 justify-between items-center leading-none">
                  <span className="text-muted-foreground">Change</span>
                  <span className={`font-mono font-medium tabular-nums ${
                    Number(percentChange) > 0 
                      ? 'text-green-600' 
                      : Number(percentChange) < 0 
                        ? 'text-red-600' 
                        : 'text-foreground'
                  }`}>
                    {Number(percentChange) > 0 ? '+' : ''}{percentChange}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const calculateDynamicDomain = () => {
    const allValues = data.flatMap(item => [
      item.count, 
      item.previousPeriodCount || 0
    ]);
    
    const max = Math.max(...allValues);
    
    // Add a little buffer at the top
    return [0, Math.max(max + 1, 5)];
  };

  return (
    <ChartContainer
      config={{
        "current": { theme: { light: "#8884d8", dark: "#8884d8" } },
        "previous": { theme: { light: "#82ca9d", dark: "#82ca9d" } },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 5, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fill: 'var(--chart-foreground)' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            domain={calculateDynamicDomain()}
            allowDecimals={false}
            tick={{ fill: 'var(--chart-foreground)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '10px',
              fontSize: '12px' 
            }} 
          />
          
          <Line
            type="monotone"
            dataKey="count"
            name="Current Period"
            stroke="var(--color-current)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
          
          <Line
            type="monotone"
            dataKey="previousPeriodCount"
            name="Previous Period"
            stroke="var(--color-previous)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ArtistRegistrationChart;
