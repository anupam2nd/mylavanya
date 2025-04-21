
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { MemberDataPoint } from '@/utils/memberDataGenerator';
import { TooltipProps } from 'recharts';
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
        <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
          <div className="font-medium">{label as string}</div>
          <div className="grid gap-1.5">
            <div className="flex w-full flex-wrap items-stretch gap-2 items-center">
              <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: "var(--color-daily-active)" }} />
              <div className="flex flex-1 justify-between items-center leading-none">
                <span className="text-muted-foreground">Daily Active Members</span>
                <span className="font-mono font-medium tabular-nums text-foreground">{dailyActive as number | string}</span>
              </div>
            </div>
            <div className="flex w-full flex-wrap items-stretch gap-2 items-center">
              <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: "var(--color-monthly-active)" }} />
              <div className="flex flex-1 justify-between items-center leading-none">
                <span className="text-muted-foreground">Monthly Active Members</span>
                <span className="font-mono font-medium tabular-nums text-foreground">{monthlyActive as number | string}</span>
              </div>
            </div>
            <div className="flex w-full flex-wrap items-stretch gap-2 items-center">
              <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: "var(--color-daily-active)" }} />
              <div className="flex flex-1 justify-between items-center leading-none">
                <span className="text-muted-foreground">DAM/MAM Ratio</span>
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {dataPoint?.damMamRatio ? `${dataPoint.damMamRatio}%` : '0%'}
                </span>
              </div>
            </div>
            {dataPoint?.event && (
              <>
                <div className="flex w-full flex-wrap items-stretch gap-2 items-center">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: "var(--color-event-marker)" }} />
                  <div className="flex flex-1 justify-between items-center leading-none">
                    <span className="text-muted-foreground">Event</span>
                    <span className="font-mono font-medium tabular-nums text-foreground">{dataPoint.event}</span>
                  </div>
                </div>
                {dataPoint.eventDescription && (
                  <div className="flex w-full flex-wrap items-stretch gap-2 items-center">
                    <div className="h-2.5 w-2.5 shrink-0 rounded-[2px] opacity-0" />
                    <div className="flex flex-1 justify-between items-center leading-none">
                      <span className="text-muted-foreground">Details</span>
                      <span className="font-mono font-medium tabular-nums text-foreground">{dataPoint.eventDescription}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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
            
            {/* Add reference lines for events with proper yAxisId */}
            {eventMarkers.map((marker, index) => (
              <ReferenceLine
                key={`event-${index}`}
                x={marker.formattedDate}
                yAxisId="left"
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
