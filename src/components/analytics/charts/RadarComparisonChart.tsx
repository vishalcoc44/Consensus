
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  useChartAnimation
} from '@/components/ui/chart';
import { useChartTheme } from '@/hooks/useChartTheme';

interface RadarComparisonChartProps {
  data: Array<{
    category: string;
    [key: string]: number | string;
  }>;
  seriesNames: string[];
  maxValue?: number;
}

const RadarComparisonChart = ({
  data,
  seriesNames,
  maxValue = 5
}: RadarComparisonChartProps) => {
  const { colors } = useChartTheme('default');
  const { getAnimationProps } = useChartAnimation();

  // Create config for the chart container
  const config = seriesNames.reduce((acc, name, index) => {
    acc[name] = {
      label: name,
      color: colors[index % colors.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <ChartContainer
      config={config}
      className="w-full aspect-square"
    >
      <RadarChart
        outerRadius="80%"
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <PolarGrid />
        <PolarAngleAxis dataKey="category" />
        <PolarRadiusAxis domain={[0, maxValue]} />
        <ChartTooltip content={<ChartTooltipContent />} />

        {seriesNames.map((series, index) => (
          <Radar
            key={series}
            name={series}
            dataKey={series}
            stroke={config[series].color}
            fill={config[series].color}
            fillOpacity={0.2}
            {...getAnimationProps(index)}
          />
        ))}

        <Legend />
      </RadarChart>
    </ChartContainer>
  );
};

export default RadarComparisonChart;
