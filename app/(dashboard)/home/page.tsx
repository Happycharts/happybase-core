"use client"
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useUser, useOrganization } from "@clerk/nextjs";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";  // Adjust the import path as needed
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [schedulingLink, setSchedulingLink] = useState('');
  const user = useUser();
  const firstName = user?.user?.firstName;
  const lastName = user?.user?.lastName;
  const email = user?.user?.primaryEmailAddress?.emailAddress;
  const orgName = useOrganization().organization?.name;
  const orgId = useOrganization().organization?.id;

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

  const handleAddSchedulingLink = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insert-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization: {
            id: orgId,
            name: orgName,
          },
          url: schedulingLink,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Scheduling link added successfully!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error adding scheduling link:', error);
      alert('An error occurred while adding the scheduling link.');
    } finally {
      setLoading(false);
    }
  };

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
                    <Link href="/apps/add">
                      Add a tool
                    </Link>
                  </Button>
                </li>
                <li className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-black mb-3">2. Add a scheduling link</h3>
                  <p className="text-black mb-4">Provide a link so your data stakeholders can schedule consultations with you</p>
                  <Input
                    className="w-full mb-4"
                    placeholder="Add your scheduling link"
                    value={schedulingLink}
                    onChange={(e) => setSchedulingLink(e.target.value)}
                  />
                  <Button
                    className="bg-black hover:bg-gray-800 text-white transition-colors duration-300"
                    onClick={handleAddSchedulingLink}
                  >
                    Add your scheduling link
                  </Button>
                </li>
                <li className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-black mb-3">3. Create a broadcast</h3>
                  <p className="text-black mb-4">Publish your tool so your partners and audience can learn about your data program</p>
                  <div className="flex items-center space-x-2">
                    <div style={{
                      position: 'relative',
                      paddingBottom: 'calc(51.36054421768708% + 41px)',
                      height: 0,
                      width: '100%'
                    }}>
                      <iframe
                        src="https://demo.arcade.software/Bc532er376ZZJTQAfWyh?embed&show_copy_link=true"
                        title="localhost:3000/apps"
                        frameBorder="0"
                        loading="lazy"
                        allow="clipboard-write"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          colorScheme: 'light'
                        }}
                      ></iframe>
                    </div>
                  </div>
                </li>
                <li className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-black mb-3">4. Invite your data stakeholders</h3>
                  <p className="text-black mb-4">Send the link to your data access portal to your partners, researchers, and LLM developers so they can request access to your data</p>
                </li>
              </ol>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
