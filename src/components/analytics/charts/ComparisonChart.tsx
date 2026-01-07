
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ReferenceLine
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  useChartAnimation
} from '@/components/ui/chart';
import { useChartTheme } from '@/hooks/useChartTheme';
import { formatValue } from '@/utils/chartFormatters';

interface ComparisonChartProps {
  title?: string;
  data: Array<{
    name: string;
    current: number;
    previous: number;
    target?: number;
  }>;
  themeType?: 'default' | 'cool' | 'warm' | 'pastel' | 'monochrome';
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  title,
  themeType = 'default'
}) => {
  const { getBarAnimationProps } = useChartAnimation();
  const { colors, chartStyle, dimensions } = useChartTheme(themeType, 'md');

  // Find max value to set proper domain
  const maxValue = Math.max(
    ...data.flatMap(item => [item.current, item.previous]),
    ...data.filter(item => item.target !== undefined).map(item => item.target as number)
  );

  return (
    <ChartContainer
      config={{
        current: {
          label: "Current Period",
          color: colors[0],
        },
        previous: {
          label: "Previous Period",
          color: colors[1],
        },
      }}
    >
      <BarChart
        data={data}
        margin={dimensions.margin}
        barGap={0}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.gridColor} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: chartStyle.textColor, fontSize: dimensions.fontSize }}
          axisLine={{ stroke: chartStyle.tickColor }}
          tickLine={{ stroke: chartStyle.tickColor }}
        />
        <YAxis
          tick={{ fill: chartStyle.textColor, fontSize: dimensions.fontSize }}
          axisLine={{ stroke: chartStyle.tickColor }}
          tickLine={{ stroke: chartStyle.tickColor }}
          tickFormatter={(value) => formatValue(value, { format: 'compact' }).value}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <ChartTooltipContent>
                  <div className="font-medium mb-1">{label}</div>
                  <div className="space-y-1">
                    {payload.map((entry, index) => (
                      <div key={`tooltip-${index}`} className="flex items-center space-x-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm opacity-70">
                          {entry.name}: {formatValue(Number(entry.value), { format: 'number' }).value}
                        </span>
                      </div>
                    ))}
                  </div>
                </ChartTooltipContent>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Bar
          dataKey="current"
          fill={colors[0]}
          name="Current Period"
          radius={[4, 4, 0, 0]}
          {...getBarAnimationProps(0)}
        />
        <Bar
          dataKey="previous"
          fill={colors[1]}
          name="Previous Period"
          radius={[4, 4, 0, 0]}
          {...getBarAnimationProps(1)}
        />
        {data.some(item => item.target !== undefined) && (
          <ReferenceLine
            y={data[0]?.target}
            stroke={colors[2]}
            strokeDasharray="3 3"
            label={{
              value: 'Target',
              fill: colors[2],
              position: 'insideTopLeft'
            }}
          />
        )}
      </BarChart>
    </ChartContainer>
  );
};

export default ComparisonChart;
