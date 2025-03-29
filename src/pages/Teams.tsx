
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';
import TeamMemberCard from '@/components/teams/TeamMemberCard';
import AddTeamMemberDialog from '@/components/teams/AddTeamMemberDialog';
import { useToast } from '@/components/ui/use-toast';

// Type definition for team member
interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  dateAdded: string;
}

// Mock data for team members
const initialTeamMembers = [
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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const { toast } = useToast();

  useEffect(() => {
    // Set page title
    document.title = 'Team Management - ConsensusAI';
  }, []);

  // Function to calculate role statistics
  const calculateRoleStats = () => {
    const stats = {
      admin: 0,
      proposer: 0,
      contributor: 0,
    };
    
    teamMembers.forEach(member => {
      if (member.role === 'Admin') stats.admin++;
      if (member.role === 'Proposer') stats.proposer++;
      if (member.role === 'Contributor') stats.contributor++;
    });
    
    return stats;
  };
  
  const roleStats = calculateRoleStats();
  
  // Function to add a new team member
  const handleAddTeamMember = (email: string, name: string, role: string) => {
    // In a real app, this would make an API call to add the user to Supabase
    // For now, we're just updating the state
    
    // Generate a random avatar
    const randomImg = Math.floor(Math.random() * 20) + 1;
    const avatar = `https://i.pravatar.cc/150?img=${randomImg}`;
    
    // Create a new member object
    const newMember: TeamMember = {
      id: teamMembers.length + 1,
      name,
      email,
      role,
      avatar,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    
    // Add the new member to the list
    setTeamMembers([...teamMembers, newMember]);
    
    // Show success toast
    toast({
      title: "Team member added",
      description: `${name} has been added to your team as a ${role}`,
    });
  };

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
                <p className="text-3xl font-bold">{teamMembers.length}</p>
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
                <span className="text-sm font-medium">{roleStats.admin}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500" 
                  style={{ width: `${(roleStats.admin / teamMembers.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Proposers</span>
                <span className="text-sm font-medium">{roleStats.proposer}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${(roleStats.proposer / teamMembers.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Contributors</span>
                <span className="text-sm font-medium">{roleStats.contributor}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${(roleStats.contributor / teamMembers.length) * 100}%` }}
                ></div>
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
              <AddTeamMemberDialog onAddMember={handleAddTeamMember} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6 animate-fade-in animate-delay-3">
        <h2 className="text-xl font-sf font-bold">All Team Members</h2>
        <AddTeamMemberDialog onAddMember={handleAddTeamMember} />
      </div>

      <div className="grid grid-cols-1 gap-4 animate-fade-in animate-delay-3">
        {teamMembers.map((member) => (
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
