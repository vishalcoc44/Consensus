
import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
}

export const StarRating = ({ value, onChange, max = 5 }: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState(0);
  
  const getLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        <div className="flex">
          {[...Array(max)].map((_, index) => {
            const ratingValue = index + 1;
            
            return (
              <button
                type="button"
                key={ratingValue}
                onClick={() => onChange(ratingValue)}
                onMouseEnter={() => setHoverValue(ratingValue)}
                onMouseLeave={() => setHoverValue(0)}
                className="focus:outline-none p-1"
                aria-label={`${ratingValue} stars`}
              >
                <Star
                  className={`h-6 w-6 transition-all ${
                    ratingValue <= (hoverValue || value)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            );
          })}
        </div>
        
        <span className="ml-3 text-sm font-medium text-consensus-grey-600">
          {value > 0 ? getLabel(value) : 'Not rated'}
        </span>
      </div>
    </div>
  );
};
