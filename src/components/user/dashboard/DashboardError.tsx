
interface DashboardErrorProps {
  error: string | null;
}

export const DashboardError = ({ error }: DashboardErrorProps) => {
  if (!error) return null;

  return (
    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
      <p>{error}</p>
      <p className="text-sm mt-2">Please try refreshing the page or contact support if the problem persists.</p>
    </div>
  );
};
