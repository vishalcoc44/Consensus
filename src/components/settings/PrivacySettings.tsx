
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Download, Trash2, FileText, Shield } from 'lucide-react';
import { deleteUserData, exportUserData } from '@/components/auth/services/authService';

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2" size={20} />
          Privacy & Data
        </CardTitle>
        <CardDescription>
          Manage your personal data and privacy preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Data Protection</h3>
          <p className="text-sm text-gray-500 mb-4">
            Your data is encrypted end-to-end and protected according to our privacy policy. 
            You have the right to access, export, or delete your personal data at any time.
          </p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div>
                <h4 className="font-medium">Export your data</h4>
                <p className="text-sm text-gray-500">Download a copy of your personal data</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleExportData} 
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center py-2">
              <div>
                <h4 className="font-medium text-red-600">Delete your data</h4>
                <p className="text-sm text-gray-500">
                  Permanently remove your personal data from our systems
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
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
                      className="bg-red-600 hover:bg-red-700"
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
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-2">Privacy Policy</h3>
          <p className="text-sm text-gray-500 mb-4">
            Our privacy policy explains how we collect, use, and protect your information.
          </p>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View Privacy Policy
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-sm text-gray-500">
          Have questions about your data? Contact our Data Protection Officer.
        </p>
      </CardFooter>
    </Card>
  );
};

export default PrivacySettings;
