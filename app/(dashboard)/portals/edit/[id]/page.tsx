"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/app/utils/supabase/clerk';
import { useRouter } from 'next/navigation';
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

type PortalData = {
  id: string;
  creator_id: string;
  app: string;
  expiration: string;
  portal_manager: string;
  invite_link: string;
};

type PendingRequest = {
  id: string;
  requester: string;
  status: string;
};

export default function EditPortal() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const router = useRouter();
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  const [portalManager, setPortalManager] = useState('');
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([
    { id: '1', requester: 'User A', status: 'Pending' },
    { id: '2', requester: 'User B', status: 'Pending' },
  ]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchPortalData = async () => {
      const id = router.prefetch;
      if (!user?.id || !id) return;

      const supabase = createClerkSupabaseClient();
      const { data, error } = await supabase
        .from('portals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching portal data:", error);
      } else {
        setPortal(data);
        setInviteLink(data.invite_link);
        setPortalManager(data.portal_manager);
      }
    };

    fetchPortalData();
  }, [ user?.id, router.prefetch]);

  const updatePortal = async () => {
    if (!user?.id || !portal) return;

    try {
      const response = await fetch(`/api/portals/update?id=${portal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invite_link: inviteLink,
          portal_manager: portalManager,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update portal');
      }

      toast({
        title: "Portal updated successfully",
      });
    } catch (error) {
      console.error("Error updating portal:", error);
      toast({
        title: "Failed to update portal",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-2xl font-bold text-gray-800">Edit Portal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inviteLink">Invite Link</Label>
              <Input
                id="inviteLink"
                type="text"
                value={inviteLink}
                onChange={(e) => setInviteLink(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="portalManager">Portal Manager</Label>
              <Input
                id="portalManager"
                type="text"
                value={portalManager}
                onChange={(e) => setPortalManager(e.target.value)}
              />
            </div>
            <Button onClick={updatePortal}>Update Portal</Button>
          </div>

          <div className="mt-8">
            <CardTitle className="text-xl font-bold text-gray-800">Pending Data Sharing Requests</CardTitle>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-gray-50">
                    <TableCell>{request.requester}</TableCell>
                    <TableCell>{request.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
