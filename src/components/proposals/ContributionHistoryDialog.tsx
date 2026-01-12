
import { useEffect, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, History, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContributionLog {
	id: string;
	change_type: 'UPDATE' | 'DELETE';
	previous_values: any;
	new_values: any;
	created_at: string;
}

interface ContributionHistoryDialogProps {
	isOpen: boolean;
	onClose: () => void;
	contributionId: string;
}

const ContributionHistoryDialog = ({ isOpen, onClose, contributionId }: ContributionHistoryDialogProps) => {
	const [logs, setLogs] = useState<ContributionLog[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (isOpen && contributionId) {
			fetchLogs();
		}
	}, [isOpen, contributionId]);

	const fetchLogs = async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from('contribution_logs')
				.select('*')
				.eq('contribution_id', contributionId)
				.order('created_at', { ascending: false });

			if (error) throw error;
			setLogs(data as ContributionLog[]);
		} catch (error) {
			console.error('Error fetching logs:', error);
		} finally {
			setLoading(false);
		}
	};

	const getChangeSummary = (log: ContributionLog) => {
		const changes: string[] = [];
		if (log.change_type === 'DELETE') return ['Contribution deleted'];

		const prev = log.previous_values || {};
		const curr = log.new_values || {};

		if (prev.comment !== curr.comment) {
			changes.push('Comment updated');
		}
		if (prev.selected_option_id !== curr.selected_option_id) {
			changes.push('Vote changed');
		}

		// Ratings check would be more complex as it's a separate table usually, 
		// but if we were logging ratings changes they would be here.
		// Our trigger is only on contributions table, so mostly comment/vote changes.

		if (changes.length === 0) return ['Details updated'];
		return changes;
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<History size={20} />
						Contribution History
					</DialogTitle>
				</DialogHeader>

				<ScrollArea className="h-[400px] pr-4">
					{loading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : logs.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No history found for this contribution.
						</div>
					) : (
						<div className="space-y-6 pl-2 pt-2">
							{logs.map((log) => (
								<div key={log.id} className="relative border-l-2 border-muted pl-6 pb-2 last:pb-0">
									<div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary" />

									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-foreground">
											{format(new Date(log.created_at), 'PPP p')}
										</span>
										<Badge variant="outline" className="text-xs">
											{log.change_type}
										</Badge>
									</div>

									<div className="space-y-2">
										{getChangeSummary(log).map((summary, idx) => (
											<p key={idx} className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
												{summary}
											</p>
										))}

										{log.previous_values?.comment && log.new_values?.comment && log.previous_values.comment !== log.new_values.comment && (
											<div className="text-xs mt-2 bg-slate-50 p-2 rounded border">
												<div className="text-red-500 line-through mb-1 opacity-70">{log.previous_values.comment}</div>
												<div className="text-green-600 font-medium">{log.new_values.comment}</div>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

export default ContributionHistoryDialog;
