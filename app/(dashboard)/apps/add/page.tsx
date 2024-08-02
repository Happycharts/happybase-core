"use client"
import { use, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogTrigger, DialogTitle, DialogDescription, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toast } from '@/components/ui/toast'
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useOrganization } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs"

const apps = [
  {
    name: "Hex",
    description: "Embed a Hex app",
    iconSrc: "https://cdn.prod.website-files.com/5d1126db676120bb4fe43762/63fd16cde55f78843fae69d8_e4184b933d3022409dd3d63191e1b123f2618cd9-250x251.png"
  },
  {
    name: "Notion",
    description: "Embed a Notion app",
    iconSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/2048px-Notion-logo.svg.png"
  },
  {
    name: "Observable",
    description: "Embed an Observable app",
    iconSrc: "https://avatars.githubusercontent.com/u/30080011?s=280&v=4"
  },
  {
    name: "Coda",
    description: "Embed a Coda document",
    iconSrc: "https://upload.wikimedia.org/wikipedia/en/3/3f/Coda_%28document_editor%29_logo.png"
  },
  {
    name: "Deepnote",
    description: "Embed your Deepnote workspace",
    iconSrc: "https://cdn-images-1.medium.com/max/1200/1*Geecfuc_bb_Fa3i4zWnsjQ.png"
  },
  {
    name: "Custom App",
    description: "Embed any app with just the URL",
    iconSrc: "https://cdn-icons-png.flaticon.com/512/487/487622.png"
  },
]

interface DialogState {
  [key: string]: boolean;
}

export default function AppsPage() {
    const { toast } = useToast()
    const [openDialogs, setOpenDialogs] = useState<DialogState>({})
    const org = useOrganization().organization?.id;
    const userName = useUser().user?.fullName;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, appName: string) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const url = formData.get('sharing-url')?.toString() || '';

      try {
        const response = await fetch('/api/apps/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appName, url, userName, }),
        });

        if (!response.ok) {
          throw new Error('Failed to add app');
        }

        toast({
          title: 'App Added',
          description: `${appName} has been added successfully.`,
        });

        setOpenDialogs(prev => ({ ...prev, [appName]: false }));
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <div className="container mx-auto pl-5 py-10">
        <h1 className="text-2xl font-bold mb-6">Add a Data App</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-5">
          {apps.map((app) => (
            <Dialog
              key={app.name}
              open={openDialogs[app.name]}
              onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, [app.name]: open }))}
            >
              <DialogTrigger asChild>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center space-x-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <img
                        src={app.iconSrc}
                        alt={`${app.name} icon`}
                        width={25}
                        height={25}
                      />
                    </div>
                    <div>
                      <CardTitle>{app.name}</CardTitle>
                      <CardDescription>{app.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogTitle>Connect {app.name}</DialogTitle>
                <DialogDescription>
                  {/* Render form based on app.name */}
                  {/* Example for Hex: */}
                  {app.name === 'Hex' && (
                    <form onSubmit={(e) => handleSubmit(e, app.name)}>
                      <p>Fill out your connection details to begin querying your data</p>
                      <div className="space-y-4 mt-4">
                        <Input name="sharing-url" placeholder="Your sharable Hex URL" />
                      </div>
                      <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                    </form>
                  )}
                  {app.name === 'Observable' && (
                    <form onSubmit={(e) => handleSubmit(e, app.name)}>
                      <p>Fill out your connection details to begin querying your data</p>
                      <div className="space-y-4 mt-4">
                        <Input name="sharing-url" placeholder="Your sharable Observable URL" />
                      </div>
                      <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                    </form>
                  )}
                    {app.name === 'Notion' && (
                    <form onSubmit={(e) => handleSubmit(e, app.name)}>
                      <p>Fill out your connection details to begin querying your data</p>
                      <div className="space-y-4 mt-4">
                        <Input name="sharing-url" placeholder="Your sharable Notion URL" />
                      </div>
                      <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                    </form>
                  )}
                    {app.name === 'Coda' && (
                    <form onSubmit={(e) => handleSubmit(e, app.name)}>
                      <p>Fill out your connection details to begin querying your data</p>
                      <div className="space-y-4 mt-4">
                        <Input name="sharing-url" placeholder="Your sharable Coda URL" />
                      </div>
                      <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                    </form>
                  )}
                </DialogDescription>
              </DialogContent>
            </Dialog>
          ))}
        </div>
        <Toaster />
      </div>
    )
  }
