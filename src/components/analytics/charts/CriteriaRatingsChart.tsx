
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface CriteriaRatingsChartProps {
  data: Array<{
    name: string;
    averageRating: number;
    importance: number;
  }>;
}

const CriteriaRatingsChart = ({ data }: CriteriaRatingsChartProps) => {
  const chartData = data.map(item => ({
    name: item.name,
    rating: item.averageRating,
    importance: item.importance
  }));

  const config = {
    rating: {
      label: 'Avg. Rating',
      color: '#4f46e5',
    },
    importance: {
      label: 'Importance',
      color: '#f59e0b',
    },
  };

  return (
    <ChartContainer
      config={config}
      className="w-full h-full"
    >
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 10]} /> {/* Max is 10 for importance, 5 for ratings */}
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey="rating" fill={config.rating.color} name={config.rating.label} />
        <Bar dataKey="importance" fill={config.importance.color} name={config.importance.label} />
      </BarChart>
    </ChartContainer>
  );
};

export default CriteriaRatingsChart;
