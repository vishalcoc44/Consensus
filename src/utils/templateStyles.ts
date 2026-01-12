export type TemplateCategory = 'hiring' | 'budget' | 'strategy' | 'product' | 'vendor';
export type TemplateFramework = 'swot' | 'six-hats' | 'pros-cons' | 'weighted-criteria';

export const getCategoryGradient = (category: string | null) => {
	// Aesthetic palettes inspired by Modern UI / Inspira UI
	switch (category?.toLowerCase()) {
		case 'hiring': return 'from-[#38bdf8]/80 to-[#818cf8]/80'; // Sky to Indigo
		case 'budget': return 'from-[#34d399]/80 to-[#2dd4bf]/80'; // Emerald to Teal
		case 'strategy': return 'from-[#c084fc]/80 to-[#e879f9]/80'; // Purple to Fuchsia
		case 'product': return 'from-[#fbbf24]/80 to-[#fb923c]/80'; // Amber to Orange
		case 'vendor': return 'from-[#f472b6]/80 to-[#fb7185]/80'; // Pink to Rose
		default: return 'from-[#94a3b8]/80 to-[#64748b]/80'; // Slate
	}
};

export const getFrameworkBadge = (framework: string | null) => {
	const labels: Record<string, string> = {
		'swot': 'SWOT Analysis',
		'six-hats': 'Six Thinking Hats',
		'pros-cons': 'Pros & Cons',
		'weighted-criteria': 'Weighted Criteria',
	};
	return labels[framework || ''] || framework;
};

export const getFrameworkStyle = (framework: string | null) => {
	switch (framework) {
		case 'six-hats':
			return {
				bg: 'bg-[#fff1f2]/50 dark:bg-[#fff1f2]/5', // Rose-50
				border: 'border-[#fecdd3]/30 dark:border-[#fecdd3]/10',
				badge: 'bg-[#ffe4e6] text-[#be123c] dark:bg-[#be123c]/20 dark:text-[#fecdd3] border-0',
				activeStep: 'bg-[#be123c] text-white shadow-[#be123c]/20',
				progress: 'bg-[#be123c]',
				ring: 'ring-[#be123c]/20',
			};
		case 'swot':
			return {
				bg: 'bg-[#eff6ff]/50 dark:bg-[#eff6ff]/5', // Blue-50
				border: 'border-[#bfdbfe]/30 dark:border-[#bfdbfe]/10',
				badge: 'bg-[#dbeafe] text-[#1e40af] dark:bg-[#1e40af]/20 dark:text-[#bfdbfe] border-0',
				activeStep: 'bg-[#1e40af] text-white shadow-[#1e40af]/20',
				progress: 'bg-[#1e40af]',
				ring: 'ring-[#1e40af]/20',
			};
		case 'pros-cons':
			return {
				bg: 'bg-[#ecfdf5]/50 dark:bg-[#ecfdf5]/5', // Emerald-50
				border: 'border-[#a7f3d0]/30 dark:border-[#a7f3d0]/10',
				badge: 'bg-[#d1fae5] text-[#047857] dark:bg-[#047857]/20 dark:text-[#a7f3d0] border-0',
				activeStep: 'bg-[#047857] text-white shadow-[#047857]/20',
				progress: 'bg-[#047857]',
				ring: 'ring-[#047857]/20',
			};
		case 'weighted-criteria':
			return {
				bg: 'bg-[#f5f3ff]/50 dark:bg-[#f5f3ff]/5', // Violet-50
				border: 'border-[#ddd6fe]/30 dark:border-[#ddd6fe]/10',
				badge: 'bg-[#ede9fe] text-[#5b21b6] dark:bg-[#5b21b6]/20 dark:text-[#ddd6fe] border-0',
				activeStep: 'bg-[#5b21b6] text-white shadow-[#5b21b6]/20',
				progress: 'bg-[#5b21b6]',
				ring: 'ring-[#5b21b6]/20',
			};
		default:
			return {
				bg: 'bg-card/50',
				border: 'border-border/50',
				badge: '',
				activeStep: 'bg-primary text-primary-foreground shadow-primary/20',
				progress: 'bg-primary',
				ring: 'ring-primary/20',
			};
	}
};
