import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from '@/components/ui/use-toast';

interface ExportDecisionButtonProps {
	decisionId: string;
	title: string;
	targetRef: React.RefObject<HTMLElement>;
}

const ExportDecisionButton: React.FC<ExportDecisionButtonProps> = ({
	decisionId,
	title,
	targetRef
}) => {
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		if (!targetRef.current) return;

		try {
			setIsExporting(true);
			toast({
				title: "Generating Report",
				description: "Please wait while we prepare your PDF...",
			});

			const element = targetRef.current;
			const canvas = await html2canvas(element, {
				scale: 2, // Higher quality
				logging: false,
				useCORS: true,
				backgroundColor: '#ffffff' // Ensure white background
			});

			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'px',
				format: 'a4'
			});

			const imgProps = pdf.getImageProperties(imgData);
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

			pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
			pdf.save(`${title.replace(/\s+/g, '_')}_Report.pdf`);

			toast({
				title: "Success",
				description: "Report downloaded successfully.",
			});
		} catch (error) {
			console.error('Export failed:', error);
			toast({
				title: "Export Failed",
				description: "There was an error generating the PDF.",
				variant: "destructive"
			});
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleExport}
			disabled={isExporting}
			className="glass-panel hover:bg-white/10"
		>
			{isExporting ? (
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
			) : (
				<Download className="mr-2 h-4 w-4" />
			)}
			Export PDF
		</Button>
	);
};

export default ExportDecisionButton;
