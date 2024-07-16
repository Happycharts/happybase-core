"use client"
import React from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button'
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MessageSquare, Calendar as CalendarIcon, Play } from 'lucide-react'
import { useUser } from "@clerk/nextjs"
import { useOrganization } from '@clerk/nextjs';
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import Link from "next/link";
import { createClient } from '@/app/utils/supabase/client';

export default function HomePage() {
  const user = useUser()
  const firstName = useUser().user?.firstName
  const lastName = useUser().user?.lastName
  const email = useUser().user?.primaryEmailAddress?.emailAddress
  const orgName = useOrganization().organization?.name
  const orgId = useOrganization().organization?.id

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen">
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-black border-opacity-20 rounded-lg mb-8">
        <CardContent className="p-8">
          <h1 className="text-4xl font-bold text-black mb-8 text-center">Welcome, {firstName}!</h1>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
            <Avatar className="h-32 w-32 ring-4 ring-black ring-offset-4">
              <AvatarImage src="/jamesbohrman.jpg" alt="James Bohrman" />
              <AvatarFallback className="text-2xl">JB</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-black">James Bohrman</h2>
              <p className="text-lg text-black font-medium">Account Manager - {orgName} </p>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                <Badge variant="outline" className="border-black text-black">SQL Expert</Badge>
                <Badge variant="outline" className="border-black text-black">Pythonista</Badge>
                <Badge variant="outline" className="border-black text-black">Enterprise</Badge>
              </div>
            </div>
          </div> 

          <blockquote className="bg-gray-50 border-l-4 border-black p-4 rounded-r-lg mb-8 italic text-black">
            "I'm here to ensure your success with our platform. Don't hesitate to reach out if you need any assistance!"
          </blockquote>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button className="flex-1 bg-black hover:bg-gray-800 text-white transition-colors duration-300">
              <Mail className="mr-2 h-5 w-5" />
              Email James
            </Button>
            <Button className="flex-1 bg-black hover:bg-green-600 text-white">
              <svg className="h-5 w-5 mr-2" fill="green" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Walkthrough Card */}
{/* Walkthrough Card */}
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-black border-opacity-20 rounded-lg mt-8">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bold text-black mb-6 text-left">Getting Started </h2>
          <p className="text-lg text-black mb-6 text-left">Follow these steps to set up and start using our platform effectively.</p>
          
          <ol className="space-y-6">
            <li className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl  font-semibold text-black mb-3">1. Connect a data source</h3>
              <p className="text-black mb-4">Connect your first data source do you can start querying your data.</p>
              <Button className="bg-black hover:bg-gray-800 text-white transition-colors duration-300">
              <Link href="/sources">
                Add a Source
                </Link>
              </Button>
            </li>
            <li className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-3">2. Open your first document</h3>
              <p className="text-black mb-4">Create collaborative documents for planning data strategy</p>
              <Button className="bg-black hover:bg-gray-800 text-white transition-colors duration-300">
              <Link href="/documents">
                Open a document
                </Link>
              </Button>
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
    </div>
  );
}