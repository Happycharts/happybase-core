"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import React, { useEffect, useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/app/utils/supabase/clerk';
import Link from 'next/link';
import { PlusCircle, FileBox, Trash2, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster"

type SourceData = {
  id: string;
  type: string;
};

const getSourceLogo = (type: string) => {
  const lowercaseName = type.toLowerCase();
  if (lowercaseName.includes('snowflake')) return 'https://asset.brandfetch.io/idJz-fGD_q/iddesHsUDj.svg?updated=1668517499361';
  if (lowercaseName.includes('postgres')) return 'https://asset.brandfetch.io/idjSeCeMle/idZol6htuN.svg?updated=1716432965006';
  if (lowercaseName.includes('cube')) return 'https://asset.brandfetch.io/idpExA2n0v/idsPNHb6Eg.svg?updated=1668080525345';
  if (lowercaseName.includes('mysql')) return 'https://upload.wikimedia.org/wikipedia/labs/8/8e/Mysql_logo.png';
  if (lowercaseName.includes('clickhouse')) return 'https://asset.brandfetch.io/idnezyZEJm/id_CPPYVKt.jpeg?updated=1684474240695';
  return '/database.svg'; // Default logo
};

export default function SchemasPage() {
  const { organization } = useOrganization();
  const [sources, setSources] = useState<SourceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSources = async () => {
      if (!organization?.id) return;
      
      setIsLoading(true);
      const supabase = createClerkSupabaseClient();
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('organization', organization.id);

      if (isMounted) {
        if (error) {
          console.error('Error fetching sources:', error);
        } else {
          setSources(data || []);
        }
        setIsLoading(false);
      }
    };

    fetchSources();

    return () => {
      isMounted = false;
    };
  }, [organization?.id]);

  const deleteSource = async () => {
    if (!organization?.id || !sourceToDelete) return;

    try {
      const response = await fetch(`~/api/sources/warehouses/delete?id=${sourceToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete source');
      }

      // Remove the deleted source from the state
      setSources(sources.filter(source => source.id !== sourceToDelete));
      setSourceToDelete(null);
    } catch (error) {
      console.error('Error deleting source:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Your Data Sources</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data sources</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new data source.</p>
              <div className="mt-6">
                <Link href="/sources/add">
                  <Button className="bg-black hover:bg-primary text-white">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Data Source
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Monthly Spend</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id} className="hover:bg-gray-50">
                    <TableCell className="flex items-center space-x-3">
                      <div className="relative w-8 h-8">
                        <img 
                          src={getSourceLogo(source.type)}
                          alt={source.type}
                          onError={(e) => {
                            e.currentTarget.src = '/database.svg';
                          }}
                        />
                      </div>
                      <span className="font-medium">{source.type}</span>
                    </TableCell>
                    <TableCell>{source.type}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="mr-2">
                              <Link href={`/schemas/${source.id}`}>
                                <FileBox className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Schemas</p>
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
                              onClick={() => setSourceToDelete(source.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete source</p>
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

      <Dialog open={!!sourceToDelete} onOpenChange={() => setSourceToDelete(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this source?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the source and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSourceToDelete(null)}>Cancel</Button>
            <Button  onClick={deleteSource}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}