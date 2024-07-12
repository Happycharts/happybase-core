"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogTrigger, DialogTitle, DialogDescription, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const sources = [
  {
    name: "Clickhouse",
    description: "Add a Clickhouse data source",
    iconSrc: "./clickhouse.svg"
  },
  {
    name: "Snowflake",
    description: "Add a Snowflake data source",
    iconSrc: "./snowflake.svg"
  },
  {
    name: "Postgres",
    description: "Add a Postgres data source",
    iconSrc: "./postgresql.svg"
  }
]

interface DialogState {
  [key: string]: boolean;
}

export default function AddSourcePage() {
  const { toast } = useToast()
  const [openDialogs, setOpenDialogs] = useState<DialogState>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, sourceName: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const credentials = {
      url: formData.get('url'),
      username: formData.get('username'),
      password: formData.get('password'),
    };
    const response = await fetch('/api/add-source/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: sourceName.toLowerCase(), credentials }),
    });
    if (response.ok) {
      toast({
        title: "Connection Successful",
        description: `Your ${sourceName} data source has been added.`,
      })
      setOpenDialogs(prev => ({ ...prev, [sourceName]: false }))
    } else {
      toast({
        title: "Connection Failed",
        description: "There was an error connecting to your data source.",
        variant: "destructive",
      })
    }
  };

  return (
    <div className="container mx-auto pl-5 py-10">
      <h1 className="text-2xl font-bold mb-6">Add a Data Source</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-5">
        {sources.map((source) => (
          <Dialog 
            key={source.name} 
            open={openDialogs[source.name]} 
            onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, [source.name]: open }))}
          >
            <DialogTrigger asChild>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center space-x-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Image
                      src={source.iconSrc}
                      alt={`${source.name} icon`}
                      width={20}
                      height={20}
                    />
                  </div>
                  <div>
                    <CardTitle>{source.name}</CardTitle>
                    <CardDescription>{source.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Connect {source.name}</DialogTitle>
              <DialogDescription>
                {source.name === 'Clickhouse' && (
                  <form onSubmit={(e) => handleSubmit(e, source.name)}>
                    <p>Fill out your connection details to begin querying your data</p>
                    <div className="space-y-4 mt-4">
                      <Input name="url" placeholder="Clickhouse URL" />
                      <Input name="username" placeholder="Username" />
                      <Input name="password" placeholder="Password" type="password" />
                    </div>
                    <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                  </form>
                )}
                {source.name === 'Snowflake' && (
                  <>
                    <p>Fill out your connection details to begin querying your data</p>
                  </>
                )}
                {source.name === 'Postgres' && (
                  <>
                    <p>Fill out your connection details to begin querying your data</p>
                  </>
                )}
              </DialogDescription>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}