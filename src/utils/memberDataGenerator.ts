
// This file generates mock data for member charts and analytics

export interface MemberDataPoint {
  date: Date;
  formattedDate: string;
  dam: number; // Daily Active Members
  mam: number; // Monthly Active Members
  damMamRatio: number;
  event?: string;
  eventDescription?: string;
}

// Generate data for active member charts
export function generateActiveMemberData(range: '7d' | '30d' | '90d' | '1y'): MemberDataPoint[] {
  const data: MemberDataPoint[] = [];
  const now = new Date();
  let days: number;
  
  // Determine number of days based on range
  switch (range) {
    case '7d':
      days = 7;
      break;
    case '30d':
      days = 30;
      break;
    case '90d':
      days = 90;
      break;
    case '1y':
      days = 365;
      break;
  }
  
  // Base values and trend factors
  const baseDAM = 100; // Base Daily Active Members
  const baseMAM = 3000; // Base Monthly Active Members
  const damGrowthFactor = 0.5; // Daily growth rate
  const mamGrowthFactor = 0.2; // Monthly growth rate
  
  // Events to mark on the chart
  const events = [
    { dayOffset: Math.floor(days * 0.2), name: "Marketing Campaign", description: "Social media promotion" },
    { dayOffset: Math.floor(days * 0.5), name: "Membership Discount", description: "20% off promotion" },
    { dayOffset: Math.floor(days * 0.8), name: "Feature Launch", description: "New booking system" }
  ];
  
  // Generate data points for each day
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i));
    
    // Calculate member counts with some random variation
    const dayProgress = i / days;
    const damGrowth = Math.pow(1 + damGrowthFactor, dayProgress);
    const mamGrowth = Math.pow(1 + mamGrowthFactor, dayProgress);
    
    const dam = Math.round(baseDAM * damGrowth * (1 + (Math.random() * 0.2 - 0.1)));
    const mam = Math.round(baseMAM * mamGrowth * (1 + (Math.random() * 0.1 - 0.05)));
    const damMamRatio = Math.round((dam / mam) * 100 * 10) / 10;
    
    // Format date for display
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
    
    // Check if this day has an event
    const event = events.find(e => e.dayOffset === i);
    
    data.push({
      date,
      formattedDate,
      dam,
      mam,
      damMamRatio,
      event: event?.name,
      eventDescription: event?.description
    });
  }
  
  return data;
}
