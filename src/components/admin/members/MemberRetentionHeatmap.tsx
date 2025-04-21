
import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

interface RetentionCohort {
  cohort: string;
  size: number;
  retentions: {
    period: string;
    rate: number;
  }[];
}

// Generate mock cohort data for the retention heatmap
const generateMockCohortData = (range: '30d' | '90d' | '1y'): RetentionCohort[] => {
  const periods = range === '30d' ? 4 : range === '90d' ? 6 : 12;
  const cohorts = [];
  
  // Generate cohorts (e.g., months)
  for (let i = 0; i < periods; i++) {
    const cohortDate = new Date();
    cohortDate.setMonth(cohortDate.getMonth() - i);
    const cohortLabel = cohortDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const cohortSize = Math.floor(Math.random() * 100) + 50;
    const retentions = [];
    
    // For each cohort, generate retention rates for periods
    for (let j = 0; j < periods - i; j++) {
      // Retention generally decreases over time with some randomness
      const baseRetention = j === 0 ? 100 : Math.max(20, 100 - j * 15 + (Math.random() * 10 - 5));
      retentions.push({
        period: `M${j + 1}`,
        rate: Math.round(baseRetention * 10) / 10
      });
    }
    
    cohorts.push({
      cohort: cohortLabel,
      size: cohortSize,
      retentions
    });
  }
  
  return cohorts;
};

// Color scale for the heatmap
const getColorForRetention = (rate: number): string => {
  if (rate >= 90) return '#16a34a'; // Green for high retention
  if (rate >= 70) return '#22c55e';
  if (rate >= 50) return '#84cc16';
  if (rate >= 30) return '#eab308';
  if (rate >= 20) return '#f97316';
  return '#ef4444'; // Red for low retention
};

interface MemberRetentionHeatmapProps {
  range: '30d' | '90d' | '1y';
}

const MemberRetentionHeatmap: React.FC<MemberRetentionHeatmapProps> = ({ range }) => {
  const cohorts = useMemo(() => generateMockCohortData(range), [range]);
  
  // Get all period labels for headers
  const allPeriods = useMemo(() => {
    const periods = new Set<string>();
    cohorts.forEach(cohort => {
      cohort.retentions.forEach(retention => {
        periods.add(retention.period);
      });
    });
    return Array.from(periods);
  }, [cohorts]);
  
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[200px_1fr] border rounded-md">
          {/* Header row with period labels */}
          <div className="p-4 font-semibold border-b border-r bg-muted/50">
            Cohort
          </div>
          <div className="grid border-b" style={{ gridTemplateColumns: `repeat(${allPeriods.length}, 1fr)` }}>
            {allPeriods.map((period) => (
              <div key={period} className="p-4 font-semibold text-center">
                {period}
              </div>
            ))}
          </div>
          
          {/* Cohort rows */}
          {cohorts.map((cohort, cohortIndex) => (
            <React.Fragment key={cohort.cohort}>
              <div className="p-4 border-r flex items-center">
                <div>
                  <div className="font-medium">{cohort.cohort}</div>
                  <div className="text-sm text-muted-foreground">
                    {cohort.size} members
                  </div>
                </div>
              </div>
              <div 
                className="grid" 
                style={{ gridTemplateColumns: `repeat(${allPeriods.length}, 1fr)` }}
              >
                {allPeriods.map((period, periodIndex) => {
                  const retention = cohort.retentions.find(r => r.period === period);
                  const isEmpty = !retention;
                  
                  return (
                    <div 
                      key={`${cohort.cohort}-${period}`} 
                      className={`relative p-4 flex items-center justify-center ${
                        periodIndex < allPeriods.length - 1 ? 'border-r' : ''
                      } ${cohortIndex < cohorts.length - 1 ? 'border-b' : ''}`}
                    >
                      {!isEmpty && (
                        <>
                          <div 
                            className="absolute inset-0 opacity-30"
                            style={{ 
                              backgroundColor: getColorForRetention(retention.rate)
                            }}
                          />
                          <span className="relative font-medium">
                            {retention.rate.toFixed(1)}%
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-6">
          <div className="text-sm font-semibold mb-2">Retention Rate</div>
          <div className="flex">
            {[0, 20, 30, 50, 70, 90, 100].map((value, i, arr) => (
              <div key={value} className="flex flex-col items-center flex-1">
                {i < arr.length - 1 && (
                  <div 
                    className="h-4 w-full"
                    style={{ 
                      backgroundColor: getColorForRetention((value + arr[i + 1]) / 2) 
                    }}
                  />
                )}
                <div className="text-xs mt-1">{value}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberRetentionHeatmap;
