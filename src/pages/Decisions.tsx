
import { useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DecisionCard from '@/components/dashboard/DecisionCard';
import CreateDecisionButton from '@/components/dashboard/CreateDecisionButton';

// Using the same mock decisions data from Dashboard.tsx
const mockDecisions = [
  {
    id: 1,
    title: 'Select New CRM Software',
    description: 'We need to choose a new CRM system that integrates with our existing tools and provides better customer insights.',
    dueDate: 'Sep 25, 2023',
    participants: 8,
    comments: 24,
    progress: 65,
    status: 'active' as const,
    consensus: 72
  },
  {
    id: 2,
    title: 'Office Relocation Planning',
    description: 'Evaluating options for relocating to a larger office space to accommodate our growing team.',
    dueDate: 'Oct 15, 2023',
    participants: 12,
    comments: 47,
    progress: 30,
    status: 'active' as const,
    consensus: 45
  },
  {
    id: 3,
    title: 'Q4 Marketing Campaign Strategy',
    description: 'Finalizing our marketing approach for Q4, including budget allocation, channel selection, and messaging framework.',
    dueDate: 'Sep 10, 2023',
    participants: 6,
    comments: 18,
    progress: 100,
    status: 'completed' as const,
    consensus: 88
  },
  {
    id: 4,
    title: 'Annual Budget Approval',
    description: 'Review and approval of the annual budget for all departments, including projected expenses and revenue targets.',
    dueDate: 'Nov 30, 2023',
    participants: 9,
    comments: 32,
    progress: 10,
    status: 'active' as const,
    consensus: 35
  }
];

const Decisions = () => {
  useEffect(() => {
    // Set page title
    document.title = 'Decisions - ConsensusAI';
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-sf font-bold mb-2">Decision Management</h1>
        <p className="text-consensus-grey-600">View and manage all your organization's decisions</p>
      </div>
      
      <div className="flex justify-between items-center mb-6 animate-fade-in">
        <h2 className="text-xl font-sf font-bold">All Decisions</h2>
        <CreateDecisionButton />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {mockDecisions.map((decision) => (
          <DecisionCard
            key={decision.id}
            title={decision.title}
            description={decision.description}
            dueDate={decision.dueDate}
            participants={decision.participants}
            comments={decision.comments}
            progress={decision.progress}
            status={decision.status}
            consensus={decision.consensus}
          />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Decisions;
