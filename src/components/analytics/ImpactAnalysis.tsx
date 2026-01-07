
import {
	Radar,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	ResponsiveContainer,
	Tooltip,
	Legend
} from 'recharts';

interface ImpactDimension {
	dimension: string;
	score: number; // 0-100
	description: string;
}

interface ImpactAnalysisProps {
	data?: ImpactDimension[];
	proposalTitle?: string;
}

const defaultData: ImpactDimension[] = [
	{ dimension: 'Financial', score: 85, description: 'High cost savings projected' },
	{ dimension: 'Operational', score: 65, description: 'Moderate workflow changes required' },
	{ dimension: 'Cultural', score: 40, description: 'Low impact on company culture' },
	{ dimension: 'Technical', score: 90, description: 'Significant tech stack upgrades' },
	{ dimension: 'Risk', score: 30, description: 'Low implementation risk' },
	{ dimension: 'Timeline', score: 75, description: 'Projected to complete ahead of schedule' },
];

const ImpactAnalysis = ({ data = defaultData, proposalTitle = "Current Proposal" }: ImpactAnalysisProps) => {
	return (
		<div className="glass-panel p-6 rounded-xl h-full flex flex-col">
			<div className="mb-6">
				<h3 className="text-lg font-bold text-white flex items-center gap-2">
					Potential Impact Analysis
				</h3>
				<p className="text-sm text-consensus-grey-400">
					Projected multidimensional impact of <strong>{proposalTitle}</strong>
				</p>
			</div>

			<div className="flex-1 min-h-[300px] w-full relative">
				<ResponsiveContainer width="100%" height="100%">
					<RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
						<PolarGrid stroke="rgba(255,255,255,0.1)" />
						<PolarAngleAxis
							dataKey="dimension"
							tick={{ fill: '#e2e8f0', fontSize: 12 }}
						/>
						<PolarRadiusAxis
							angle={30}
							domain={[0, 100]}
							tick={false}
							axisLine={false}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: 'rgba(23, 23, 23, 0.95)',
								border: '1px solid rgba(255,255,255,0.1)',
								borderRadius: '12px',
								color: '#fff',
								backdropFilter: 'blur(12px)',
								boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
							}}
							itemStyle={{ color: '#fff' }}
							cursor={{ stroke: '#4ade80', strokeWidth: 2 }}
						/>
						<Radar
							name="Impact Score"
							dataKey="score"
							stroke="#8b5cf6"
							strokeWidth={3}
							fill="#8b5cf6"
							fillOpacity={0.3}
						/>
						<Legend />
					</RadarChart>
				</ResponsiveContainer>
			</div>

			<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
				{data.map((item, index) => (
					<div key={index} className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-start flex-col">
						<div className="flex items-center justify-between w-full mb-1">
							<span className="text-xs font-semibold text-consensus-grey-300 uppercase tracking-wider">{item.dimension}</span>
							<span className={`text-xs font-bold ${item.score > 70 ? 'text-green-400' : item.score > 40 ? 'text-amber-400' : 'text-consensus-grey-400'}`}>{item.score}/100</span>
						</div>
						<p className="text-xs text-consensus-grey-400">{item.description}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default ImpactAnalysis;
