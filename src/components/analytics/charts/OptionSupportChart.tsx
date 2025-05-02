
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  useChartAnimation,
  formatChartValue
} from '@/components/ui/chart';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface OptionSupportProps {
  data: Array<{
    option: string;
    votes: number;
    percentage: number;
    sentiment: number;
    score: number;
  }>;
}

const OptionSupportChart = ({ data }: OptionSupportProps) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const { getBarAnimationProps } = useChartAnimation();
  
  // Filter out abstained votes for the chart
  const chartData = data
    .filter(item => item.option !== 'Abstained')
    .map(item => ({
      name: isMobile ? item.option.substring(0, 10) + (item.option.length > 10 ? '...' : '') : item.option,
      votes: item.votes,
      score: item.score,
      sentiment: Math.round(item.sentiment * 100)
    }));
  
  const config = {
    votes: {
      label: 'Votes',
      color: '#4f46e5',
    },
    score: {
      label: 'Support Score',
      color: '#0ea5e9',
    },
    sentiment: {
      label: 'Sentiment %',
      color: '#10b981',
    },
  };

  return (
    <ChartContainer
      config={config}
      className="w-full aspect-[4/3]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 10, right: 30, left: 0, bottom: isMobile ? 40 : 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name"
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 80 : 30}
          />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar 
            dataKey="votes" 
            fill={config.votes.color} 
            name={config.votes.label} 
            radius={[4, 4, 0, 0]}
            {...getBarAnimationProps(0)}
          />
          <Bar 
            dataKey="score" 
            fill={config.score.color} 
            name={config.score.label}
            radius={[4, 4, 0, 0]}
            {...getBarAnimationProps(1)}
          />
          <Bar 
            dataKey="sentiment" 
            fill={config.sentiment.color} 
            name={config.sentiment.label}
            radius={[4, 4, 0, 0]}
            {...getBarAnimationProps(2)}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default OptionSupportChart;
