
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Loader2, RefreshCw, User, Lock, Shield, Upload, LogOut, ChevronRight, Key } from 'lucide-react';
import { getUserProfile } from '@/components/auth/services/authService';
import PrivacySettings from '@/components/settings/PrivacySettings';
import { uploadFileToSupabase } from '@/utils/fileUpload';
import { cn } from '@/lib/utils';
import ShimmerText from '@/components/ui/effects/ShimmerText';

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
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
        return;
      }

      try {
        const profileData = await getUserProfile(session.user.id);

        if (profileData) {
          setProfile(profileData as Profile);
          setFullName(profileData.full_name || '');
          setAvatarUrl(profileData.avatar_url || '');
        } else {
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

          if (createError) throw createError;

          setProfile(newProfile as Profile);
          setFullName(newProfile.full_name || '');
          setAvatarUrl(newProfile.avatar_url || '');
        }
      } catch (profileError) {
        console.error('Error loading profile:', profileError);
        setError('There was a problem loading your profile.');
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "Please try refreshing the page."
        });
      }
    } catch (error) {
      console.error('Error in getProfile:', error);
      setError('Unable to load your profile.');
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
        navigate('/login');
        return;
      }

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

      if (updateError) throw updateError;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });

      const { data: refreshedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (refreshedProfile) {
        setProfile(refreshedProfile as Profile);
      }

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
      toast({ title: "Signed out", description: "You have been signed out successfully." });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({ variant: "destructive", title: "Sign out failed", description: "There was a problem signing out." });
    }
  };

  return (
    <div className="container max-w-5xl py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            <ShimmerText className="inline-block">Account Settings</ShimmerText>
          </h1>
          <p className="text-muted-foreground">Manage your personal information, privacy and security</p>
        </div>

        {error && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRetryCount(curr => curr + 1)}
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm animate-pulse">Loading settings...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8 p-1 bg-muted/40 backdrop-blur-sm border border-border/50 rounded-xl w-full md:w-auto overflow-x-auto justify-start h-auto">
            <TabsTrigger
              value="profile"
              className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300"
            >
              <Shield className="h-4 w-4 mr-2" />
              Privacy & Data
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300"
            >
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 slide-in-from-bottom-4 focus-visible:outline-none">
            <div className="glass-panel rounded-xl p-8 overflow-hidden relative">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                  <User size={18} />
                </span>
                Profile Information
              </h2>

              <div className="flex flex-col md:flex-row gap-10">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-br from-consensus-green to-consensus-teal rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                    <Avatar className="relative h-32 w-32 border-4 border-background shadow-xl">
                      <AvatarImage src={avatarUrl || undefined} alt={fullName || 'User'} className="object-cover" />
                      <AvatarFallback className="bg-muted text-4xl font-medium text-muted-foreground">
                        {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <label
                      className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:bg-primary/90 hover:scale-105 transition-all duration-200"
                      title="Upload new picture"
                    >
                      <Upload size={14} />
                      <input
                        type="file"
                        className="hidden"
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
                    </label>
                  </div>

                  {avatarUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvatarUrl('')}
                      className="text-xs text-muted-foreground hover:text-destructive h-7"
                    >
                      Remove picture
                    </Button>
                  )}
                </div>

                {/* Form Section */}
                <div className="flex-1 space-y-6 max-w-xl">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-muted/50 border-transparent font-medium text-muted-foreground"
                    />
                    <p className="text-[10px] text-muted-foreground ml-1">
                      Email cannot be changed directly for security reasons.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-foreground font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-background/50 border-input transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <Button
                      onClick={updateProfile}
                      disabled={updating}
                      className="min-w-[120px] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
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
            </div>

            <div className="glass-panel rounded-xl p-8 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-1">Sign Out</h3>
                  <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                </div>
                <Button
                  variant="outline"
                  onClick={signOut}
                  className="hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all duration-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="focus-visible:outline-none">
            <PrivacySettings />
          </TabsContent>

          <TabsContent value="security" className="focus-visible:outline-none slide-in-from-bottom-4">
            <div className="glass-panel rounded-xl p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-full bg-primary/10 mr-4">
                  <Lock className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Security Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage your account security and authentication</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Password", desc: "Change your password regularly to keep your account secure", action: "Change Password", icon: Key },
                  { title: "Two-Factor Authentication", desc: "Add an extra layer of security to your account", action: "Enable 2FA", icon: Shield },
                  { title: "Login Sessions", desc: "Manage your active login sessions across devices", action: "View Sessions", icon: Loader2 }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                      <div className="p-2 rounded-lg bg-background shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
                      {item.action}
                      <ChevronRight className="ml-2 h-3 w-3 opacity-50" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>

  );
};

export default Settings;
