
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend
} from 'recharts';

interface TrendData {
	date: string;
	consensusScore: number;
	sentimentScore: number;
}

interface TrendAnalysisChartProps {
	data: TrendData[];
}

const TrendAnalysisChart = ({ data }: TrendAnalysisChartProps) => {
	return (
		<ResponsiveContainer width="100%" height="100%">
			<LineChart
				data={data}
				margin={{
					top: 10,
					right: 30,
					left: 0,
					bottom: 0,
				}}
			>
				<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
				<XAxis
					dataKey="date"
					stroke="#94a3b8"
					fontSize={12}
					tickLine={false}
					axisLine={false}
					padding={{ left: 10, right: 10 }}
				/>
				<YAxis
					stroke="#94a3b8"
					fontSize={12}
					tickLine={false}
					axisLine={false}
					domain={[0, 100]}
				/>
				<Tooltip
					contentStyle={{
						backgroundColor: 'rgba(23, 23, 23, 0.9)',
						border: '1px solid rgba(255,255,255,0.1)',
						borderRadius: '12px',
						color: '#fff',
						backdropFilter: 'blur(12px)'
					}}
					itemStyle={{ color: '#fff' }}
					labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
				/>
				<Legend wrapperStyle={{ paddingTop: '20px' }} />
				<Line
					type="monotone"
					name="Consensus Score"
					dataKey="consensusScore"
					stroke="#4ade80"
					strokeWidth={3}
					dot={{ fill: '#1e293b', stroke: '#4ade80', strokeWidth: 2, r: 4 }}
					activeDot={{ r: 6, strokeWidth: 0 }}
				/>
				<Line
					type="monotone"
					name="Positive Sentiment"
					dataKey="sentimentScore"
					stroke="#60a5fa"
					strokeWidth={3}
					dot={{ fill: '#1e293b', stroke: '#60a5fa', strokeWidth: 2, r: 4 }}
					activeDot={{ r: 6, strokeWidth: 0 }}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
};

export default TrendAnalysisChart;
