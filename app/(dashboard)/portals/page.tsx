"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import React, { useEffect, useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/app/utils/supabase/clerk';
import Link from 'next/link';
import { AlertCircle, Trash2, RadioTower, Edit } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster";
import { useUser, useClerk } from '@clerk/nextjs';
import { AnalyticsBrowser } from '@segment/analytics-next'

type PortalData = {
  id: string;
  creator_id: string;
  app: string;
  expiration: string;
  portal_manager: string;
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

export default function Portals() {
  const { organization, membership } = useOrganization();
  const [portals, setPortals] = useState<PortalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [portalToDelete, setPortalToDelete] = useState<string | null>(null);
  const { user } = useUser();
  const { session } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const analytics = AnalyticsBrowser.load({ writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY! });


  useEffect(() => {
    let isMounted = true;
    const fetchDataAndCheckAdmin = async () => {
      if (!user?.id || !organization?.id) return;
  
      setIsLoading(true);
      const supabase = createClerkSupabaseClient();
  
      // Fetch portals
      const { data: portalsData, error: portalsError } = await supabase
        .from('portals')
        .select('*')
        .eq('creator_id', user.id);
  
      if (portalsError) {
        console.error("Error fetching portals:", portalsError);
      } else if (isMounted) {
        setPortals(portalsData || []);
      }
  
      const adminStatus = checkIfUserIsAdmin();
      if (isMounted) {
        setIsAdmin(adminStatus);
      }
  
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
        analytics.track('Portal Deleted', {
          userId: user.id,
          organizationId: organization.id,
          portalId: portalToDelete,
        });
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

  const deletePortal = async () => {
    if (!user?.id || !portalToDelete) return;

    try {
      const response = await fetch(`/api/portals/delete?id=${portalToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete portal');
      }

      setPortals(portals.filter(portal => portal.id !== portalToDelete));
      setPortalToDelete(null);
      toast({
        title: "Portal deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting portal:", error);
      toast({
        title: "Failed to delete portal",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const stripeConnectUrl = merchantData?.onboarding_link || `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_Qa1YXbHMD2SL28qGP1igjAmJyc3oeq6W&scope=read_write&redirect_uri=https://app.happybase.co/portals`;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Your Portals</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : portals.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No portals</h3>
              <p className="mt-1 text-sm text-gray-500">Start by creating a portal for an app.</p>
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
                {portals.map((portal) => (
                  <TableRow key={portal.id} className="hover:bg-gray-50">
                    <TableCell className="flex items-center space-x-3">
                      {appLogos[portal.app as keyof typeof appLogos] && (
                        <img src={appLogos[portal.app as keyof typeof appLogos]} alt={`${portal.app} logo`} className="w-8 h-8" />
                      )}
                      <span className="font-medium">{portal.app}</span>
                    </TableCell>
                    <TableCell>{portal.portal_manager}</TableCell>
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
                  <div className="flex space-x-2">
                    {/* <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/portals/edit/${portal.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-black hover:text-[#fc4b6a]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit portal</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider> */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setPortalToDelete(portal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete portal</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!portalToDelete} onOpenChange={(open) => setPortalToDelete(open ? portalToDelete : null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this portal?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the portal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPortalToDelete(null)}>Cancel</Button>
            <Button onClick={deletePortal}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}