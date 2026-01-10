
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Loader2, RefreshCw, User, Lock, Shield, Upload } from 'lucide-react';
import { getUserProfile } from '@/components/auth/services/authService';
import PrivacySettings from '@/components/settings/PrivacySettings';
import { uploadFileToSupabase } from '@/utils/fileUpload';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, check that we have a valid session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log("No session found, redirecting to login");
        navigate('/login');
        return;
      }

      console.log("Current user ID:", session.user.id);

      try {
        // Use the getUserProfile function from our auth service
        const profileData = await getUserProfile(session.user.id);

        if (profileData) {
          console.log("Profile loaded successfully:", profileData);
          setProfile(profileData as Profile);
          setFullName(profileData.full_name || '');
          setAvatarUrl(profileData.avatar_url || '');
        } else {
          console.log("No profile found for user, creating one");
          // If no profile exists, create one
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
              email: session.user.email,
              created_at: new Date().toISOString()
            })
            .select('*')
            .single();

          if (createError) {
            console.error("Error creating profile:", createError);
            throw createError;
          }

          setProfile(newProfile as Profile);
          setFullName(newProfile.full_name || '');
          setAvatarUrl(newProfile.avatar_url || '');
        }
      } catch (profileError) {
        console.error('Error loading profile:', profileError);
        setError('There was a problem loading your profile. Please try again later.');

        // Show toast notification for the error
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "There was a problem loading your profile information. Please try refreshing the page."
        });
      }
    } catch (error) {
      console.error('Error in getProfile:', error);
      setError('Unable to load your profile. Please try again later.');

      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: "There was a problem loading your profile information."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, [navigate, toast, retryCount]);

  const updateProfile = async () => {
    try {
      setUpdating(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log("No session found, redirecting to login");
        navigate('/login');
        return;
      }

      console.log("Updating profile for user:", session.user.id);

      const updates = {
        id: session.user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        email: session.user.email,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updates);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log("Profile updated successfully");

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });

      // Refresh the profile data
      const { data: refreshedProfile, error: refreshError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (refreshError) {
        console.error('Error refreshing profile:', refreshError);
      } else {
        setProfile(refreshedProfile as Profile);
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      setError('There was a problem updating your profile.');

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

  const handleRetryProfileLoad = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  return (
    <DashboardLayout>
      <div className="container max-w-5xl py-8">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6 flex items-center justify-between">
            <div>{error}</div>
            <Button
              variant="outline"
              size="sm"
              className="ml-4 text-sm flex items-center"
              onClick={handleRetryProfileLoad}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh profile
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Privacy & Data
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
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

                      <div className="space-y-4">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Profile Picture</Label>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="outline"
                              className="relative overflow-hidden"
                              type="button"
                              disabled={updating}
                            >
                              <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  try {
                                    setUpdating(true);
                                    const url = await uploadFileToSupabase(file, 'avatars');
                                    if (url) {
                                      setAvatarUrl(url);
                                      toast({
                                        title: "Image uploaded",
                                        description: "Don't forget to save your changes.",
                                      });
                                    } else {
                                      throw new Error("Upload failed");
                                    }
                                  } catch (error) {
                                    toast({
                                      variant: "destructive",
                                      title: "Upload failed",
                                      description: "Could not upload image. Please try again.",
                                    });
                                  } finally {
                                    setUpdating(false);
                                  }
                                }}
                              />
                              <Upload className="mr-2 h-4 w-4" />
                              Upload New Picture
                            </Button>
                            {avatarUrl && (
                              <Button
                                variant="ghost"
                                type="button"
                                onClick={() => setAvatarUrl('')}
                                className="text-destructive hover:text-destructive/90"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Recommended: Square image, max 2MB.
                          </p>
                        </div>
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

              <Card className="mt-6">
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
            </TabsContent>

            <TabsContent value="privacy">
              <PrivacySettings />
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Password</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Update your password to keep your account secure
                      </p>
                      <Button variant="outline">Change Password</Button>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Login Sessions</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        View and manage your active login sessions
                      </p>
                      <Button variant="outline">Manage Sessions</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
