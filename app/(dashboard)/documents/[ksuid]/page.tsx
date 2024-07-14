"use client";

import Editor from "@/components/editor/advanced-editor";
import { Button } from "@/components/ui/button";
import "./prosemirror.css";
import "./editor.css"
import { ThemeProvider } from "@/components/editor/theme-provider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { JSONContent } from "novel";
import { useState, useEffect, useCallback } from "react";
import { defaultValue } from "./default-value";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "@/components/ui/select";
import { useParams, useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast";
import { useSetDocumentId } from '@veltdev/react';
import { useIdentify } from '@veltdev/react'
import { useAuth, useUser, useOrganization } from "@clerk/nextjs"
import { User } from "@veltdev/types/types";


export default function DocumentPage() {
  const router = useRouter();
  const params = useParams<{ ksuid: string; }>()
  console.log(params)

  const viewer = useUser();

const userService = () => {
  return {
    uid:  viewer.user?.id!,
    displayName: viewer.user?.fullName!,
    email: viewer.user?.primaryEmailAddress?.emailAddress!,
    photoURL: viewer.user?.imageUrl!,
    color: "#fc4c69", // Use valid Hex code value. Used in the background color of the user's avatar.
    textColor: "#000000", // Use valid Hex code value. Used in the text color of the user's intial when photoUrl is not present.
  }
}

const yourAuthenticatedUser = userService()

const { uid, displayName, email, photoURL, color, textColor } = yourAuthenticatedUser;

const user: User = {
  userId: viewer.user?.id!,
  name: viewer.user?.fullName!,
  email: viewer.user?.primaryEmailAddress?.emailAddress!,
  photoUrl: viewer.user?.imageUrl!,
  color: "#fc4c69", // Use valid Hex code value. Used in the background color of the user's avatar.
  textColor: "#000000", // Use valid Hex code value. Used in the text color of the user's intial when photoUrl is not present.
};

useIdentify(user)

  const ksuid = params.ksuid;

  useSetDocumentId(ksuid);

  interface Source {
    id: number;
    name: string;
    type: string;
    credentials: any;
  }

  const [queryResult, setQueryResult] = useState(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [value, setValue] = useState<JSONContent>(defaultValue);

  const { toast } = useToast()

  console.log(value);

  const handleNewDoc = () => {
    setValue(defaultValue);
  };

  const handleAddSource = useCallback(() => {
    router.push('/sources/add');
  }, [router]);

  useEffect(() => {
    const fetchSources = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/fetch-sources');
        if (!response.ok) {
          throw new Error('Failed to fetch sources');
        }
        const { data } = await response.json();
        setSources(data);
      } catch (error) {
        console.error('Error fetching sources:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSources();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-grow">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/documents">Documents</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Current Document</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={isLoading ? "Loading..." : "Select a source"} />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading">Loading...</SelectItem>
                ) : sources.length > 0 ? (
                  sources.map((source) => (
                    <SelectItem key={source.id} value={source.id.toString()}>
                      {source.name || source.type}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="add" onSelect={handleAddSource}>
                    Add a source
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button className="text-white bg-black hover:text-black" onClick={handleNewDoc}>New Document</Button>
          </div>
        </div>
        <Editor initialValue={value} onChange={setValue} />
      </div>
    </ThemeProvider>
  );
}