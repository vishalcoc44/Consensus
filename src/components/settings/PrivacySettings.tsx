
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Download, Trash2, FileText, Shield, Lock } from 'lucide-react';
import { deleteUserData, exportUserData } from '@/components/auth/services/authService';
import { cn } from '@/lib/utils';

const PrivacySettings = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const userData = await exportUserData();

      // Create a downloadable file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      // Create download link and trigger it
      const a = document.createElement('a');
      a.href = url;
      a.download = `your-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported successfully",
        description: "Your data has been downloaded to your device.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was a problem exporting your data. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = async () => {
    try {
      setIsDeleting(true);
      await deleteUserData();

      toast({
        title: "Data deleted",
        description: "Your personal data has been removed from our systems.",
      });
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: "There was a problem deleting your data. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-8 animate-fade-in slide-in-from-bottom-4">
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-full bg-primary/10 mr-4">
          <Shield className="text-primary h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Privacy & Data</h2>
          <p className="text-sm text-muted-foreground">
            Manage your personal data and privacy preferences
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-muted/30 p-5 rounded-lg border border-border/50">
          <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Data Protection
          </h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Your data is encrypted end-to-end and protected according to our privacy policy.
            You have the right to access, export, or delete your personal data at any time.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center py-3 px-4 bg-background/50 rounded-lg hover:bg-background/80 transition-colors border border-transparent hover:border-border/50">
              <div>
                <h4 className="font-medium text-sm">Export your data</h4>
                <p className="text-xs text-muted-foreground">Download a copy of your personal data</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={isExporting}
                className="hover:bg-primary/5 hover:text-primary transition-colors"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Export
                  </>
                )}
              </Button>
            </div>

            <div className="flex justify-between items-center py-3 px-4 bg-red-50/50 dark:bg-red-900/10 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-100 dark:border-red-900/30">
              <div>
                <h4 className="font-medium text-sm text-red-600 dark:text-red-400">Delete your data</h4>
                <p className="text-xs text-red-600/70 dark:text-red-400/70">
                  Permanently remove your personal data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40">
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete your personal data from our systems.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDeleteData}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Yes, delete my data"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <h3 className="text-base font-medium mb-1">Privacy Policy</h3>
            <p className="text-xs text-muted-foreground">
              Review how we collect, use, and protect your information.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5">
            <FileText className="mr-2 h-3.5 w-3.5" />
            Read Policy
          </Button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">
          Have questions about your data? Contact our Data Protection Officer.
        </p>
      </div>
    </div>
  );
};

export default PrivacySettings;
