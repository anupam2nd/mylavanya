
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { MemberDataPoint } from '@/utils/memberDataGenerator';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface MemberRegistrationChartProps {
  data: MemberDataPoint[];
}

const MemberRegistrationChart = ({ data }: MemberRegistrationChartProps) => {
  // Find data points with events to mark them on the chart
  const eventMarkers = data.filter(point => point.event);

  // Custom tooltip component that works with Recharts
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const dailyActive = payload[0].value;
      const monthlyActive = payload[1].value;
      const dataPoint = data.find(d => d.formattedDate === label);
      
      return (
        <ChartTooltip>
          <ChartTooltipContent 
            title={label as string}
            content={[
              { name: 'Daily Active Members', value: dailyActive as number | string },
              { name: 'Monthly Active Members', value: monthlyActive as number | string },
              { 
                name: 'DAM/MAM Ratio',
                value: dataPoint?.damMamRatio + '%'
              },
              ...(dataPoint?.event ? [
                { 
                  name: 'Event',
                  value: dataPoint.event
                },
                { 
                  name: 'Details',
                  value: dataPoint.eventDescription || ''
                }
              ] : [])
            ]}
          />
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={{
          "daily-active": { theme: { light: "#8884d8", dark: "#8884d8" } },
          "monthly-active": { theme: { light: "#82ca9d", dark: "#82ca9d" } },
          "event-marker": { theme: { light: "#ff8042", dark: "#ff8042" } },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fill: 'var(--chart-foreground)' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: 'var(--chart-foreground)' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fill: 'var(--chart-foreground)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Add reference lines for events */}
            {eventMarkers.map((marker, index) => (
              <ReferenceLine
                key={`event-${index}`}
                x={marker.formattedDate}
                stroke="#ff8042"
                strokeDasharray="3 3"
                label={{ 
                  value: marker.event, 
                  position: 'insideTopRight',
                  fill: '#ff8042',
                  fontSize: 12
                }}
              />
            ))}
            
            <Line
              type="monotone"
              dataKey="dam"
              name="Daily Active Members"
              stroke="var(--color-daily-active)"
              yAxisId="left"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="mam"
              name="Monthly Active Members"
              stroke="var(--color-monthly-active)"
              yAxisId="right"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default MemberRegistrationChart;
