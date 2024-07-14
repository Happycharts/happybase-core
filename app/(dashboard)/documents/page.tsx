"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import React, { useEffect, useState } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/app/utils/supabase/clerk';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Edit2, FileBox, Trash2, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useParams, useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import ksuid from 'ksuid'

interface Room {
    id: string;
    name: string;
    created_at: string;
    // Add other properties as needed
  }
  
  export default function RoomsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [rooms, setRooms] = useState<Room[]>([]);
    const { organization } = useOrganization();
    const [provider, setProvider] = useState<any>();

    const params = useParams<{ ksuid: string; }>()
    console.log(params)

    const roomId = params.ksuid;
  
    // Set up Liveblocks Yjs provider

    async function createRoom() {
      if (!organizationId) {
        return;
      }
    
      try {
        const response = await fetch('/api/create-room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ organizationId }),
        });
    
        if (!response.ok) {
          console.error('Error creating room:', response.statusText);
          return;
        }
    
        const { roomId } = await response.json();
        // Navigate to the new room's document page
      } catch (error) {
        console.error('Error creating room:', error);
      }
    }
    
  
  function useRoomKUID() {
      const [roomKUID, setRoomKUID] = useState<string | null>(null);
    
      useEffect(() => {
        const generateOrRetrieveKUID = () => {
          // Check if a KUID already exists in localStorage
          const existingKUID = localStorage.getItem('roomKUID');
    
          if (existingKUID) {
            setRoomKUID(existingKUID);
          } else {
            // Generate a new KUID
            const newKUID = `room_${ksuid.randomSync().string}`;
            localStorage.setItem('roomKUID', newKUID);
            setRoomKUID(newKUID);
          }
        };
    
        generateOrRetrieveKUID();
      }, []);
    
      return roomKUID;
    }
  
    const roomKUID = useRoomKUID();
  
    const organizationId = useOrganization().organization?.id;
  
    async function fetchActiveRooms(organizationId: string) {
      const supabase = createClerkSupabaseClient();
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('organization', organizationId)
    
      if (error) {
        console.error('Error fetching active rooms:', error);
        return [];
      }
    
      return data || [];
    }
  
    useEffect(() => {
      async function fetchData() {
        if (!organization) {
          setIsLoading(false);
          return;
        }
  
        const activeRooms = await fetchActiveRooms(organization.id);
        setRooms(activeRooms);
        setIsLoading(false);
      }
  
      fetchData();
    }, [organization]);


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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active rooms</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new room.</p>
              <div className="mt-6">
              <Link href={`/documents/${roomKUID}`}>
                <Button className="bg-black hover:bg-primary text-white" onClick={createRoom}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Room
                </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id} className="hover:bg-gray-50">
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{new Date(room.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="mr-2">
                              <Link href={`/documents/${roomKUID}`}>
                              <FileBox className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Open Docuement</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Document</p>
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
    </div>
  );
 }