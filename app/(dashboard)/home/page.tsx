/* eslint-disable react/no-deprecated */
"use client"
import * as z from 'zod'
import AutoForm from '@/components/auto-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, DollarSign, ClipboardCopy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Toast } from '@/components/ui/toast'
import React, { Component, useRef, use, useState } from 'react'
import kafka from "@/public/kafka.svg"
import notion from "@/public/notion.svg"
import mongodb from "@/public/mongodb.svg"
import hubspot from "@/public/hubspot.svg"
import s3 from "@/public/s3.svg"
import Image from 'next/image'
import { Badge } from '@radix-ui/themes';
import { render } from "react-dom";
import { Label } from "@/components/ui/label"
import { BrainCircuit } from 'lucide-react';
import { useSidebarToggle } from '@/app/hooks/use-sidebar-toggle';
import { useToast } from '@/components/ui/use-toast';
import { useOrganization, useUser } from '@clerk/nextjs'
import { VeltProvider, VeltComments, VeltPresence } from '@veltdev/react';
import { createClerkSupabaseClient } from '@/app/utils/supabase/clerk'
import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import Lottie from '@lottielab/lottie-player/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import Sentry from "react-activity/dist/Sentry";
import "react-activity/dist/Sentry.css";
import Dots from "react-activity/dist/Dots";
import "react-activity/dist/Dots.css";
import { Input } from '@/components/ui/input';

type SourceData = {
  logo: string;
  name: string;
  accessUrl: string;
  monthlySpend: number;
} | null;

interface DataSourcePortalProps {
  logo: string;
  name: string;
  accessUrl: string;
  monthlySpend: number;
}

const sourceSchemas = {
  snowflake: z.object({
    username: z.string(),
    password: z.string(),
    database: z.string(),
    account: z.string(),
    region: z.string(),
    warehouse: z.string(),
  }),
  databricks: z.object({
    accessToken: z.string(),
    jbdcUrl: z.string(),
    catalog: z.string(),
    acceptPolicy: z.boolean(),
  }),
  bigquery: z.object({
    projectId: z.string(),
    credentials: z.string(),
    location: z.string(),
  }),
  mongodb: z.object({
    host: z.string(),
    name: z.string(),
    username: z.string(),
    password: z.string(),
    ssl: z.enum(['true', 'false']),
  }),
  database: z.object({
    type: z.enum(['MySQL', 'Postgres', 'SQLLite', 'SQL Server']),
    host: z.string(),
    username: z.string(),
    database: z.string(),
    password: z.string(),
  }),
  redshift: z.object({
    host: z.string(),
    name: z.string(),
    username: z.string(),
    password: z.string(),
  }),
  clickhouse: z.object({
    host: z.string(),
    name: z.string(),
    username: z.string(),
    password: z.string(),
  }),
}

export default function SourcesPage() {
  const [selectedSchema, setSelectedSchema] = React.useState<any>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const { isOpen } = useSidebarToggle();
  const { toast } = useToast();
  const organization = useOrganization();
  const orgMetadata = organization?.organization?.publicMetadata || {};
  const cubeApi = orgMetadata.cube_api || '';
  const sourceType = orgMetadata.source || '';
  const orgName = organization?.organization?.slug || '';
  const [sources, setSources] = useState<{ id: string; name: string; type: string; status: string }[]>([]);
  const user = useUser();
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [showCollabDialog, setShowCollabDialog] = useState(false);
  const veltKey = process.env.NEXT_PUBLIC_VELT_KEY!;
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const formRef = useRef<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const sourceOptions = {
    Snowflake: { label: "Snowflake", icon: "./snowflake.svg" },
    databricks: { label: "Databricks", icon: "./databricks.svg" },
    bigquery: { label: "Google BigQuery", icon: "./bigquery.svg" },
    redshift: { label: "Amazon Redshift", icon: "./redshift.svg" },
    clickhouse: { label: "Clickhouse", icon: "./clickhouse.svg" },
    database: { label: "Database", icon: "./database.svg" },
    mongodb: { label: "MongoDB", icon: "./mongodb.svg" },
  };

  const sourceRoutes = {
  snowflake: 'Snowflake',
  databricks: 'Databricks',
  bigquery: 'BigQuery',
  redshift: 'Redshift',
  clickhouse: 'Clickhouse',
  database: 'Database',
  mongodb: 'MongoDB',
};

interface ConnectionDetails {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  driver: string;
  ssl: boolean;
  type: string;
}

const handleSourceChange = (value: string) => {
  setSelectedSource(value);
  setSelectedSchema(sourceSchemas[value as keyof typeof sourceSchemas]);
};


// const handleSubmit = async (data: any) => {
//   try {
//     const response = await fetch('/api/deploy-cube', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         orgName,
//         sourceType: selectedSource,
//         connectionDetails: data,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error('Deployment failed');
//     }

//     const result = await response.json();
    
//     // Handle successful deployment
//     toast({
//       title: "Deployment Successful",
//       description: `Your Cube instance is now available at ${result.cubeUrl}`,
//     });

//     // Update UI or state as needed
//     setNewSource({
//       logo: sourceOptions[selectedSource as keyof typeof sourceOptions].icon,
//       name: data.name || selectedSource || '',
//       accessUrl: result.cubeUrl,
//       monthlySpend: 100 // Replace with actual calculation
//     });

//     setSelectedSource(null);
//     setSelectedSchema(null);
//   } catch (error) {
//     console.error('Deployment error:', error);
//     toast({
//       title: "Deployment Failed",
//       description: "There was an error deploying your Cube instance. Please try again.",
//       variant: "destructive",
//     });
//   }
// };

  return (
    <div className="container mx-auto p-6">
      <div className="flex gap-4 mb-6">
        <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/jamesbohrman.jpg" alt="James Bohrman" />
              <AvatarFallback>JB</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">James Bohrman</h2>
              <p className="text-gray-600">Your Dedicated Account Manager</p>
            </div>
          </div> 
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="text-gray-800 italic">
            &quot;I&apos;m here to ensure your success with our platform. Don&apos;t hesitate to reach out if you need any assistance!&quot;
          </p>
        </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-sm text-gray-500">Email</Label>
              <p className="font-medium">james@tryportcullis.io</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Phone</Label>
              <p className="font-medium">+1 (555) 123-4567</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button className="flex-1 bg-black hover:bg-gray-400 text-white">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
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
      </div>
    </div>
  );
}