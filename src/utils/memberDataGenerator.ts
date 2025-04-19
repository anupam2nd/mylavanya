
import { format, subDays } from "date-fns";

export interface Event {
  date: string;
  name: string;
  description: string;
}

export interface MemberDataPoint {
  date: string;
  formattedDate: string;
  dam: number;
  mam: number;
  damMamRatio: string;
  event?: string;
  eventDescription?: string;
}

const events: Event[] = [
  { date: '2025-02-01', name: 'Membership Drive', description: 'Annual membership promotion' },
  { date: '2025-03-15', name: 'New Features', description: 'Launched loyalty program' },
  { date: '2025-04-10', name: 'Spring Campaign', description: 'Seasonal member benefits' },
];

export const generateActiveMemberData = (range: '7d' | '30d' | '90d' | '1y'): MemberDataPoint[] => {
  const data: MemberDataPoint[] = [];
  let periods = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const baseDam = 80;
  const baseMam = 500;
  const damVariance = 20;
  const mamVariance = 100;
  
  const today = new Date();
  
  for (let i = 0; i < periods; i++) {
    const date = subDays(today, periods - i - 1);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const growthFactor = 1 + (i * 0.003);
    const dam = Math.floor((baseDam * growthFactor) + (Math.random() * damVariance - damVariance/2));
    const mam = Math.floor((baseMam * growthFactor) + (Math.random() * mamVariance - mamVariance/2));
    
    const damMamRatio = (dam / mam * 100).toFixed(1);
    
    const dataPoint: MemberDataPoint = {
      date: dateStr,
      formattedDate: format(date, 'MMM dd'),
      dam,
      mam,
      damMamRatio,
    };
    
    const event = events.find(e => e.date === dateStr);
    if (event) {
      dataPoint.event = event.name;
      dataPoint.eventDescription = event.description;
    }
    
    data.push(dataPoint);
  }
  
  return data;
};
