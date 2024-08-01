"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MessageSquare, Calendar as CalendarIcon, Play, Copy } from 'lucide-react';
import { useUser, useOrganization } from "@clerk/nextjs";
import Cal, { getCalApi } from "@calcom/embed-react";
import Link from "next/link";
import { createClient } from '@/app/utils/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";  // Adjust the import path as needed
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [cubeUrl, setCubeUrl] = useState('');
  const user = useUser();
  const firstName = user?.user?.firstName;
  const lastName = user?.user?.lastName;
  const email = user?.user?.primaryEmailAddress?.emailAddress;
  const orgName = useOrganization().organization?.name;
  const orgId = useOrganization().organization?.id;

  useEffect(() => {
    const fetchCubeUrl = async () => {
      if (!orgId) {
        console.error('Organization ID is missing');
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('organizations')
        .select('cube_url')
        .eq('id', orgId)
        .single();

      if (error) {
        console.error('Error fetching Cube URL:', error);
      } else {
        setCubeUrl(data.cube_url);
      }

      setLoading(false);
    };

    fetchCubeUrl();
  }, [orgId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cubeUrl).then(() => {
      alert('Cube URL copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const SkeletonContent = () => (
    <>
      <Card className="w-full max-w-4xl mx-auto border-black border-opacity-20 rounded-lg mb-8">
        <CardContent className="p-8">
          <Skeleton className="h-10 w-3/4 mx-auto mb-8" />
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="w-full">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
          <Skeleton className="h-20 w-full mb-8" />
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-black border-opacity-20 rounded-lg mt-8">
        <CardContent className="p-8">
          <Skeleton className="h-10 w-1/2 mb-6" />
          <Skeleton className="h-6 w-3/4 mb-6" />
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="mb-6">
              <Skeleton className="h-8 w-3/4 mb-3" />
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-10 w-40" />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen">
      {loading ? (
        <SkeletonContent />
      ) : (
        <>
          {/* New Walkthrough Card */}
          <Card className="w-full max-w-4xl mx-auto shadow-lg border-black border-opacity-20 rounded-lg mt-8">
            <CardContent className="p-8">
              <h2 className="text-4xl font-bold text-black mb-6 text-left">Welcome to Happybase!</h2>
              <h2 className="text-2xl font-bold text-black mb-6 text-left">Getting Started</h2>
              <p className="text-lg text-black mb-6 text-left">Follow these steps to get set up and start using our platform effectively.</p>

              <ol className="space-y-6">
                <li className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-black mb-3">1. Connect your first tool</h3>
                  <p className="text-black mb-4">Connect a tool so you can start centralizing your semantic layer.</p>
                  <Button className="bg-black hover:bg-gray-800 text-white transition-colors duration-300">
                    <Link href="/apps/">
                      Add a Source
                    </Link>
                  </Button>
                </li>
                <li className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-black mb-3">2. Copy your Cube URL</h3>
                  <p className="text-black mb-4">Copy your Cube URL so you can use it</p>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={cubeUrl}
                      readOnly
                      className="w-full border rounded px-2 py-1"
                    />
                    <Button onClick={copyToClipboard} className="bg-black hover:bg-gray-800 text-white transition-colors duration-300">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
                <li className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-black mb-3">3. Invite your team</h3>
                  <p className="text-black mb-4">Invite your teammates to make collaboration more fun and effective</p>
                </li>
                <li className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-black mb-3">4. Start querying your data</h3>
                  <p className="text-black mb-4">Open a collaborative SQL editor right from your scratchpad to go from planning to execution</p>
                </li>
              </ol>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}