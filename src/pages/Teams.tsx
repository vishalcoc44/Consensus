
import { useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Users } from 'lucide-react';
import TeamMemberCard from '@/components/teams/TeamMemberCard';
import TeamRoleSelector from '@/components/teams/TeamRoleSelector';

// Mock data for team members
const mockTeamMembers = [
  {
    id: 1,
    name: 'Jessica Thompson',
    email: 'jessica@example.com',
    role: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=1',
    dateAdded: 'Jan 12, 2023',
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael@example.com',
    role: 'Proposer',
    avatar: 'https://i.pravatar.cc/150?img=11',
    dateAdded: 'Mar 5, 2023',
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'Contributor',
    avatar: 'https://i.pravatar.cc/150?img=5',
    dateAdded: 'Apr 18, 2023',
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david@example.com',
    role: 'Proposer',
    avatar: 'https://i.pravatar.cc/150?img=12',
    dateAdded: 'May 22, 2023',
  },
  {
    id: 5,
    name: 'Aisha Patel',
    email: 'aisha@example.com',
    role: 'Contributor',
    avatar: 'https://i.pravatar.cc/150?img=9',
    dateAdded: 'Jun 7, 2023',
  },
  {
    id: 6,
    name: 'Robert Kim',
    email: 'robert@example.com',
    role: 'Contributor',
    avatar: 'https://i.pravatar.cc/150?img=15',
    dateAdded: 'Jul 30, 2023',
  },
];

const Teams = () => {
  useEffect(() => {
    // Set page title
    document.title = 'Team Management - ConsensusAI';
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-sf font-bold mb-2">Team Management</h1>
        <p className="text-consensus-grey-600">Manage your organization's team members and their roles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{mockTeamMembers.length}</p>
                <p className="text-sm text-consensus-grey-600">Total members</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in animate-delay-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Admins</span>
                <span className="text-sm font-medium">1</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '16.6%' }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Proposers</span>
                <span className="text-sm font-medium">2</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '33.3%' }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Contributors</span>
                <span className="text-sm font-medium">3</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '50%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in animate-delay-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Inactive Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-consensus-grey-600">No inactive members</p>
              </div>
              <Button variant="outline" className="rounded-lg border-dashed">
                <UserPlus size={18} className="mr-2" />
                Invite Members
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6 animate-fade-in animate-delay-3">
        <h2 className="text-xl font-sf font-bold">All Team Members</h2>
        <Button className="bg-consensus-blue hover:bg-consensus-blue/90 rounded-lg">
          <UserPlus size={18} className="mr-2" />
          Add Team Member
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 animate-fade-in animate-delay-3">
        {mockTeamMembers.map((member) => (
          <TeamMemberCard
            key={member.id}
            name={member.name}
            email={member.email}
            role={member.role}
            avatar={member.avatar}
            dateAdded={member.dateAdded}
          />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Teams;
