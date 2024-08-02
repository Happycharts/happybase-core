"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import React, { useEffect, useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/app/utils/supabase/clerk';
import Link from 'next/link';
import { AlertCircle, Trash2, RadioTower } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster";
import { useUser, useClerk } from '@clerk/nextjs';

type BroadcastData = {
  id: string;
  creator_id: string;
  app: string;
  expiration: string;
  creator_name: string;
};

type MerchantData = {
  id: string;
  organization: string;
  onboarding_link: string | null;
};

const appLogos = {
  "Hex": "https://cdn.prod.website-files.com/5d1126db676120bb4fe43762/63fd16cde55f78843fae69d8_e4184b933d3022409dd3d63191e1b123f2618cd9-250x251.png",
  "Notion": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/2048px-Notion-logo.svg.png",
  "Observable": "https://avatars.githubusercontent.com/u/30080011?s=280&v=4",
  "Coda": "https://upload.wikimedia.org/wikipedia/en/3/3f/Coda_%28document_editor%29_logo.png",
  "Deepnote": "https://cdn-images-1.medium.com/max/1200/1*Geecfuc_bb_Fa3i4zWnsjQ.png",
  "Custom App": "https://cdn-icons-png.flaticon.com/512/487/487622.png"
};

export default function Broadcasts() {
  const { organization, membership } = useOrganization();
  const [broadcasts, setBroadcasts] = useState<BroadcastData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [broadcastToDelete, setBroadcastToDelete] = useState<string | null>(null);
  const { user } = useUser();
  const { session } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDataAndCheckAdmin = async () => {
      if (!user?.id || !organization?.id) return;
  
      setIsLoading(true);
      const supabase = createClerkSupabaseClient();
  
      // Fetch broadcasts
      const { data: broadcastsData, error: broadcastsError } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('creator_id', user.id);
  
      if (broadcastsError) {
        console.error("Error fetching broadcasts:", broadcastsError);
      } else if (isMounted) {
        setBroadcasts(broadcastsData || []);
      }
  
      const adminStatus = checkIfUserIsAdmin();
      if (isMounted) {
        setIsAdmin(adminStatus);
      }
  
      // Check if the user is connected to Stripe
      // This is a placeholder. You'll need to implement the actual check based on your backend logic
      const { data: stripeData, error: stripeError } = await supabase
        .from('stripe_connections')
        .select('*')
        .eq('organization_id', organization.id)
        .single();

        const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('organization', organization.id)
        .single();


      if (merchantError) {
        console.error("Error fetching merchant data:", merchantError);
      } else if (isMounted) {
        setMerchantData(merchantData);
        setIsStripeConnected(!!merchantData?.onboarding_link);
      }
  
      setIsLoading(false);
    };
  
    fetchDataAndCheckAdmin();
  
    return () => {
      isMounted = false;
    };
  }, [user?.id, organization?.id, membership]);

  function checkIfUserIsAdmin(): boolean {
    if (!membership) return false;
    console.log("User role:", membership.role);
    return membership.role === 'org:admin' || membership.role === 'admin';
  }

  const deleteBroadcast = async () => {
    if (!user?.id || !broadcastToDelete) return;

    try {
      const response = await fetch(`/api/broadcasts/delete?id=${broadcastToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete broadcast');
      }

      setBroadcasts(broadcasts.filter(broadcast => broadcast.id !== broadcastToDelete));
      setBroadcastToDelete(null);
      toast({
        title: "Broadcast deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting broadcast:", error);
      toast({
        title: "Failed to delete broadcast",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const stripeConnectUrl = merchantData?.onboarding_link || `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_Qa1YXbHMD2SL28qGP1igjAmJyc3oeq6W&scope=read_write&redirect_uri=https://app.happybase.co/broadcasts`;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Your Broadcasts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No broadcasts</h3>
              <p className="mt-1 text-sm text-gray-500">Start by broadcasting an app.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Stripe Connect</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((broadcast) => (
                  <TableRow key={broadcast.id} className="hover:bg-gray-50">
                    <TableCell className="flex items-center space-x-3">
                      {appLogos[broadcast.app as keyof typeof appLogos] && (
                        <img src={appLogos[broadcast.app as keyof typeof appLogos]} alt={`${broadcast.app} logo`} className="w-8 h-8" />
                      )}
                      <span className="font-medium">{broadcast.app}</span>
                    </TableCell>
                    <TableCell>{broadcast.creator_name}</TableCell>
                    <TableCell>
                    {isAdmin ? (
                      <Link href={stripeConnectUrl}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={isStripeConnected}
                          className="flex items-center space-x-2"
                        >
                          <img src="https://cdn.iconscout.com/icon/free/png-256/free-stripe-s-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-company-brand-vol-6-pack-logos-icons-3030363.png" className="h-4 w-4" />
                          <span>{isStripeConnected ? 'Connected to Stripe' : 'Connect with Stripe'}</span>
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="flex items-center space-x-2">
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-stripe-s-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-company-brand-vol-6-pack-logos-icons-3030363.png" className="h-4 w-4" />
                        <span>Connect with Stripe</span>
                      </Button>
                    )}
                  </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setBroadcastToDelete(broadcast.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete broadcast</p>
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

      <Dialog open={!!broadcastToDelete} onOpenChange={(open) => setBroadcastToDelete(open ? broadcastToDelete : null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this broadcast?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the broadcast.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastToDelete(null)}>Cancel</Button>
            <Button onClick={deleteBroadcast}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}