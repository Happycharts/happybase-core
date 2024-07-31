"use client"
import { useState } from "react"
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

const apps = [
  {
    name: "Hex",
    description: "Add a Hex apps",
    iconSrc: "https://cdn.prod.website-files.com/5d1126db676120bb4fe43762/63fd16cde55f78843fae69d8_e4184b933d3022409dd3d63191e1b123f2618cd9-250x251.png"
  },
  {
    name: "Snowflake",
    description: "Add a Snowflake apps",
    iconSrc: "https://asset.brandfetch.io/idJz-fGD_q/iddesHsUDj.svg?updated=1668517499361"
  },
  {
    name: "Postgres",
    description: "Add a Postgres apps",
    iconSrc: "https://asset.brandfetch.io/idjSeCeMle/idZol6htuN.svg?updated=1716432965006"
  },
  {
    name: "Google Sheets",
    description: "Add a Google Sheets apps",
    iconSrc: "https://play-lh.googleusercontent.com/keE2gN0Hqh8-Tsf_RYZ_-yS2uo6ToqYVyRBv_UZaLXsgeeHBd2YPcEUWEF4DEtfGyb1h"
  },
  {
    name: "Amazon Kinesis",
    description: "Add a Kinesis apps",
    iconSrc: "https://trino.io/docs/current/_static/img/kinesis.png"
  },
  {
    name: "MySQL",
    description: "Add a MySQL apps",
    iconSrc: "https://trino.io/docs/current/_static/img/mysql.png"
  },
  {
    name: "Apache Druid",
    description: "Add a Druid apps",
    iconSrc: "https://trino.io/docs/current/_static/img/druid.png"
  },
  {
    name: "Redshift",
    description: "Add a Redshift apps",
    iconSrc: "https://trino.io/docs/current/_static/img/redshift.png"
  }
]

interface DialogState {
  [key: string]: boolean;
}

export default function AppsPage() {
    const { toast } = useToast()
    const [openDialogs, setOpenDialogs] = useState<DialogState>({})
    const org = useOrganization().organization?.id;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, appName: string) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const url = formData.get('sharing-url')?.toString() || '';

      try {
        const response = await fetch('/api/apps/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appName, url }),
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
                        <Input name="sharing-url" placeholder="https://app.hex.tech/12709cd6-e9dc-47c3-a6b7-5ef72acfba4e/app/8103413b-a2b7-492c-beee-f06aed8968e6/latest" />
                      </div>
                      <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                    </form>
                  )}
                  {/* Add similar conditions for other app types */}
                </DialogDescription>
              </DialogContent>
            </Dialog>
          ))}
        </div>
        <Toaster />
      </div>
    )
  }
