
interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  if (!error) return null;
  
  return (
    <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-lg">
      {error}
    </div>
  );
};

export default ErrorDisplay;
