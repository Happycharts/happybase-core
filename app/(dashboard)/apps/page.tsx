"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import React, { useEffect, useState } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/app/utils/supabase/clerk';
import Link from 'next/link';
import { PlusCircle, FileBox, Trash2, AlertCircle, Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Toast } from '@/components/ui/toast'
import { toast, useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster";

type appData = {
  id: string;
  creator: string;
  name: string;
};

export default function Apps() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const [Apps, setApps] = useState<appData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appToDelete, setappToDelete] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchApps = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      const supabase = createClerkSupabaseClient();
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('creator', user.id);

      if (error) {
        console.error(error);
      } else {
        if (isMounted) {
          setApps(data || []);
        }
      }
      setIsLoading(false);
    };

    fetchApps();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const deleteApp = async () => {
    if (!user?.id || !appToDelete) return;

    try {
      const response = await fetch(`/api/apps/delete?id=${appToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete app');
      }

      // Remove the deleted app from the state
      setApps(Apps.filter(app => app.id !== appToDelete));
      setappToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard!",
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };
  // Add logging to ensure state updates are correct
  useEffect(() => {
    console.log('Apps:', Apps);
    console.log('appToDelete:', appToDelete);
  }, [Apps, appToDelete]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Your Data Apps</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : Apps.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data Apps</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new data app.</p>
              <div className="mt-6">
                <Link href="/apps/add">
                  <Button className="bg-black hover:bg-primary text-white">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Data app
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Apps.map((app) => (
                  <TableRow key={app.id} className="hover:bg-gray-50">
                    <TableCell className="flex items-center space-x-3">
                      <span className="font-medium">{app.name}</span>
                    </TableCell>
                    <TableCell>{app.creator}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={app.id}
                          readOnly
                          className="w-full border rounded px-2 py-1"
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(app.id)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy ID</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="mr-2">
                              <Link href={`/apps/${app.id}`}>
                                <FileBox className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Open App</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setappToDelete(app.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete app</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Toaster />

      <Dialog open={!!appToDelete} onOpenChange={(open) => setappToDelete(open ? appToDelete : null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this app?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the app and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setappToDelete(null)}>Cancel</Button>
            <Button onClick={deleteApp}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}