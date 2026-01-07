
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface SentimentPieChartProps {
  data: {
    positive: number;
    neutral: number;
    negative: number;
    averageSentiment: number;
  };
}

const SentimentPieChart = ({ data }: SentimentPieChartProps) => {
  const chartData = [
    { name: 'Positive', value: data.positive, fill: '#10b981' },
    { name: 'Neutral', value: data.neutral, fill: '#f59e0b' },
    { name: 'Negative', value: data.negative, fill: '#ef4444' }
  ];

  const config = {
    positive: {
      label: 'Positive',
      color: '#10b981',
    },
    neutral: {
      label: 'Neutral',
      color: '#f59e0b',
    },
    negative: {
      label: 'Negative',
      color: '#ef4444',
    },
  };

  return (
    <ChartContainer
      config={config}
      className="w-full h-full"
    >
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltipContent />} />
        <Legend verticalAlign="bottom" />
      </PieChart>
    </ChartContainer>
  );
};

export default SentimentPieChart;
