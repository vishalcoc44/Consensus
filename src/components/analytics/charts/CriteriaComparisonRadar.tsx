
import { useEffect, useState } from 'react';
import RadarComparisonChart from './RadarComparisonChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { transformForRadarChart } from '@/utils/chartFormatters';

interface CriteriaComparisonRadarProps {
  options?: Array<{
    name: string;
    criteria: Array<{
      name: string;
      rating: number;
    }>;
  }>;
}

const CriteriaComparisonRadar = ({ 
  options = [
    {
      name: 'Option A',
      criteria: [
        { name: 'Cost', rating: 4 },
        { name: 'Quality', rating: 3 },
        { name: 'Speed', rating: 5 },
        { name: 'Reliability', rating: 2 },
        { name: 'Support', rating: 4 }
      ]
    },
    {
      name: 'Option B',
      criteria: [
        { name: 'Cost', rating: 2 },
        { name: 'Quality', rating: 5 },
        { name: 'Speed', rating: 3 },
        { name: 'Reliability', rating: 4 },
        { name: 'Support', rating: 3 }
      ]
    },
  ]
}: CriteriaComparisonRadarProps) => {
  const [visibleOptions, setVisibleOptions] = useState<string[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  
  // Initialize with all options visible
  useEffect(() => {
    if (options.length > 0) {
      setVisibleOptions(options.map(opt => opt.name));
      
      // Extract all unique criteria names
      const allCriteria = [...new Set(
        options.flatMap(opt => opt.criteria.map(c => c.name))
      )];
      
      // Transform data for radar chart
      const transformedData = transformForRadarChart(
        options,
        allCriteria,
        (item, category) => {
          const criterion = item.criteria.find(c => c.name === category);
          return criterion?.rating || 0;
        }
      );
      
      setRadarData(transformedData);
    }
  }, [options]);
  
  const toggleOption = (optionName: string) => {
    setVisibleOptions(prev => 
      prev.includes(optionName)
        ? prev.filter(name => name !== optionName)
        : [...prev, optionName]
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Options Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {options.map((option, index) => (
            <Button
              key={index}
              variant={visibleOptions.includes(option.name) ? "default" : "outline"}
              onClick={() => toggleOption(option.name)}
              size="sm"
              className="mb-2"
            >
              {option.name}
            </Button>
          ))}
        </div>
        <div className="h-80">
          <RadarComparisonChart
            data={radarData}
            seriesNames={options
              .filter(opt => visibleOptions.includes(opt.name))
              .map(opt => opt.name)}
            maxValue={5}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CriteriaComparisonRadar;
