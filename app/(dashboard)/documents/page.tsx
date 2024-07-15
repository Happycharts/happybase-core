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
import { useToast } from "@/components/ui/use-toast";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import ksuid from 'ksuid'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";

interface Document {
  id: string;
  name: string;
  created_at: string;
}

export default function DocumentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const organizationId = useOrganization().organization?.id;
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [roomKUID, setRoomKUID] = useState<string | null>(null);
  
  function useRoomKUID() {    
      useEffect(() => {
        const generateOrRetrieveKUID = () => {
          // Check if a KUID already exists in localStorage
          const existingKUID = localStorage.getItem('roomKUID');
    
          if (existingKUID) {
            setRoomKUID(existingKUID);
          } else {
            // Generate a new KUID
            const newKUID = `doc_${ksuid.randomSync().string}`;
            localStorage.setItem('roomKUID', newKUID);
            setRoomKUID(newKUID);
          }
        };
    
        generateOrRetrieveKUID();
      }, []);
    
      return roomKUID;
    }

  const id = useRoomKUID();

  async function createDocument() {
    if (!organizationId) return;
    if (!roomKUID) return;
  
    const newDocumentKUID = `doc_${ksuid.randomSync().string}`;

    try {
      const response = await fetch('/api/documents/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomKUID: newDocumentKUID, organizationId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create document');
      }
  
      const { documentId } = await response.json();
  
      await fetchDocuments();
      toast({
        title: "Success",
        description: "New document created successfully.",
      });
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "Failed to create a new document. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function fetchDocuments() {
    if (!organizationId) return;

    try {
      const response = await fetch('/api/documents/get');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (organizationId) {
      fetchDocuments();
    }
  }, [organizationId]);

  useEffect(() => {
    async function loadDocuments() {
      setIsLoading(true);
      await fetchDocuments();
      setIsLoading(false);
    }

    if (organizationId) {
      loadDocuments();
    }
  }, [organizationId]);

  async function deleteDocument(documentId: string) {
    try {
      const response = await fetch(`/api/documents/delete?id=${documentId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
  
      await fetchDocuments();
      toast({
        title: "Success",
        description: "Document deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete the document. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteConfirm() {
    if (documentToDelete) {
      await deleteDocument(documentToDelete);
      setDocumentToDelete(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/home">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Documents</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Your Documents</CardTitle>
            <Button className="bg-black hover:bg-primary text-white" onClick={createDocument}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active documents</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new document.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id} className="hover:bg-gray-50">
                    <TableCell>{new Date(document.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={() => setCurrentDocumentId(document.id)} variant="outline" size="sm" className="mr-2">
                              <Link href={`/documents/${document.id}`}>
                                <FileBox className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Open Document</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDocumentToDelete(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this document? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDocumentToDelete(null)}>Cancel</Button>
                      <Button onClick={handleDeleteConfirm}>Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                  </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}