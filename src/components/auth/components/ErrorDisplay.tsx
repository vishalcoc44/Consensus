
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string | null;
  title?: string;
}

const ErrorDisplay = ({ error, title = "Error" }: ErrorDisplayProps) => {
  if (!error) return null;
  
  return (
    <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-lg shadow-lg animate-fade-in">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-sm mb-1">{title}</h4>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
