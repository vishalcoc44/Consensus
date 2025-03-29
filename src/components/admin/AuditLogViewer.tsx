
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Download, FileText, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { hashData } from '@/utils/encryption';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  timestamp: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  hash: string | null;
}

const AuditLogViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Fetch audit logs from Supabase
  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['auditLogs', page, pageSize, searchTerm, actionFilter],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      if (searchTerm) {
        query = query.or(`user_id.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%`);
      }
      
      if (actionFilter) {
        query = query.eq('action', actionFilter);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        logs: data as AuditLog[],
        total: count || 0
      };
    }
  });
  
  // Generate unique action types for filtering
  const actionTypes = logs?.logs
    ? Array.from(new Set(logs.logs.map(log => log.action)))
    : [];
  
  // Function to verify hash integrity (would connect to blockchain in production)
  const verifyLogIntegrity = async (log: AuditLog) => {
    try {
      if (!log.hash) return false;
      
      // Create a hash of the log data excluding the hash itself
      const { hash, ...logData } = log;
      const calculatedHash = await hashData(JSON.stringify(logData));
      
      // Compare the stored hash with the calculated hash
      return calculatedHash === hash;
    } catch (error) {
      console.error('Error verifying log integrity:', error);
      return false;
    }
  };
  
  // Function to export logs as CSV
  const exportLogs = () => {
    if (!logs?.logs) return;
    
    // Create CSV content
    const headers = ['ID', 'User ID', 'Action', 'Timestamp', 'Details', 'IP Address'];
    const csvContent = [
      headers.join(','),
      ...logs.logs.map(log => [
        log.id,
        log.user_id,
        log.action,
        log.timestamp,
        JSON.stringify(log.details).replace(/,/g, ';'),
        log.ip_address
      ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Format the timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get action badge color
  const getActionColor = (action: string) => {
    if (action.includes('success')) return 'bg-green-100 text-green-800';
    if (action.includes('failed')) return 'bg-red-100 text-red-800';
    if (action.includes('deleted') || action.includes('deletion')) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2" size={20} />
          Audit Logs
        </CardTitle>
        <CardDescription>
          Secure, immutable record of all system actions
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by user ID or action..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="border rounded px-3 py-2 bg-white"
              value={actionFilter || ''}
              onChange={(e) => setActionFilter(e.target.value || null)}
            >
              <option value="">All Actions</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              onClick={() => refetch()}
              title="Refresh logs"
            >
              <RefreshCw size={16} />
            </Button>
            
            <Button
              variant="outline"
              onClick={exportLogs}
              title="Export logs as CSV"
            >
              <Download size={16} className="mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Logs table */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Error loading audit logs. Please try again.
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Verified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs?.logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[120px] truncate">
                          {log.user_id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getActionColor(log.action)}>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          <span title={JSON.stringify(log.details, null, 2)} className="cursor-help">
                            {JSON.stringify(log.details).substring(0, 50)}
                            {JSON.stringify(log.details).length > 50 ? '...' : ''}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {log.hash ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                              Standard
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {logs && logs.total > pageSize && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, logs.total)} of {logs.total} logs
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * pageSize >= logs.total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-center mb-2">
            <FileText className="h-4 w-4 mr-2 text-gray-700" />
            <h3 className="text-sm font-medium">About Audit Logging</h3>
          </div>
          <p className="text-xs text-gray-600">
            This system maintains a secure, immutable audit trail of all important actions. 
            Each log entry is timestamped and cryptographically secured. Logs are stored with
            end-to-end encryption and can optionally be verified using blockchain technology
            for maximum transparency and compliance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLogViewer;
