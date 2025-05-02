
import React from 'react';

interface TrackingErrorProps {
  message: string | null;
}

const TrackingError = ({ message }: TrackingErrorProps) => {
  if (!message) return null;
  
  return (
    <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
      {message}
    </div>
  );
};

export default TrackingError;
