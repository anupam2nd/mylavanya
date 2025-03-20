
import React from 'react';

interface TrackingErrorProps {
  error: string | null;
}

const TrackingError = ({ error }: TrackingErrorProps) => {
  if (!error) return null;
  
  return (
    <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
      {error}
    </div>
  );
};

export default TrackingError;
