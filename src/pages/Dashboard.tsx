
import { useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DecisionCard from '@/components/dashboard/DecisionCard';
import CreateDecisionButton from '@/components/dashboard/CreateDecisionButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, BarChart, Users, Brain } from 'lucide-react';

const mockDecisions = [
  {
    id: 1,
    title: 'Select New CRM Software',
    description: 'We need to choose a new CRM system that integrates with our existing tools and provides better customer insights. The current system lacks advanced reporting and AI capabilities that could help our sales team.',
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
    description: 'Evaluating options for relocating to a larger office space to accommodate our growing team. Need to consider location, cost, amenities, and accessibility.',
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
  },
  {
    id: 5,
    title: 'New Product Feature Prioritization',
    description: 'Determining which features to prioritize for our next product release based on customer feedback, market trends, and technical feasibility.',
    dueDate: 'Oct 5, 2023',
    participants: 7,
    comments: 29,
    progress: 50,
    status: 'active' as const,
    consensus: 63
  },
  {
    id: 6,
    title: 'Team Structure Reorganization',
    description: 'Evaluating how to restructure our teams for better efficiency and collaboration after recent growth.',
    dueDate: 'Aug 22, 2023',
    participants: 5,
    comments: 15,
    progress: 100,
    status: 'archived' as const,
    consensus: 91
  }
];

const Dashboard = () => {
  useEffect(() => {
    // Set page title
    document.title = 'Dashboard - ConsensusAI';
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-sf font-bold mb-2">Welcome back, John</h1>
        <p className="text-consensus-grey-600">Here's an overview of your organization's decision-making activities</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card className="animate-fade-in animate-delay-1">
          <CardHeader className="pb-2">
            <CardDescription>Active Decisions</CardDescription>
            <CardTitle className="text-2xl">12</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-consensus-grey-600">
                <span className="text-emerald-500">+2</span> from last month
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Brain size={18} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animate-delay-2">
          <CardHeader className="pb-2">
            <CardDescription>Team Members</CardDescription>
            <CardTitle className="text-2xl">28</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-consensus-grey-600">
                <span className="text-emerald-500">+4</span> new this month
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <Users size={18} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animate-delay-3">
          <CardHeader className="pb-2">
            <CardDescription>Avg. Consensus</CardDescription>
            <CardTitle className="text-2xl">76%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-consensus-grey-600">
                <span className="text-emerald-500">+5%</span> improvement
              </div>
              <div className="p-2 rounded-full bg-emerald-100">
                <LineChart size={18} className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in animate-delay-4">
          <CardHeader className="pb-2">
            <CardDescription>Decision Velocity</CardDescription>
            <CardTitle className="text-2xl">4.2 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-consensus-grey-600">
                <span className="text-emerald-500">-1.3 days</span> faster
              </div>
              <div className="p-2 rounded-full bg-amber-100">
                <BarChart size={18} className="text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-6 animate-fade-in animate-delay-5">
        <h2 className="text-xl font-sf font-bold">Active Decisions</h2>
        <CreateDecisionButton />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in animate-delay-5">
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

export default Dashboard;
