
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }
        
        setProfile(data as Profile);
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || '');
      } catch (error) {
        console.error('Error in getProfile:', error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "There was a problem loading your profile information."
        });
      } finally {
        setLoading(false);
      }
    };
    
    getProfile();
  }, [navigate, toast]);

  const updateProfile = async () => {
    try {
      setUpdating(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      const updates = {
        id: session.user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert(updates);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile."
      });
    } finally {
      setUpdating(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was a problem signing out."
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-5xl py-8">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={avatarUrl || undefined} alt={fullName || 'User'} />
                      <AvatarFallback>{fullName ? fullName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        placeholder="Enter your full name" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="avatarUrl">Avatar URL</Label>
                      <Input 
                        id="avatarUrl" 
                        value={avatarUrl || ''} 
                        onChange={(e) => setAvatarUrl(e.target.value)} 
                        placeholder="Enter avatar URL (optional)" 
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={updateProfile} 
                        disabled={updating}
                      >
                        {updating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={signOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
