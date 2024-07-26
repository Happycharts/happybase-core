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
import { CatalogConfig, CatalogProperty } from '@/app/types/catalog';
import { useOrganization } from "@clerk/nextjs";

const sources = [
  {
    name: "Clickhouse",
    description: "Add a Clickhouse catalog",
    iconSrc: "https://asset.brandfetch.io/idnezyZEJm/id_CPPYVKt.jpeg?updated=1684474240695"
  },
  {
    name: "Snowflake",
    description: "Add a Snowflake catalog",
    iconSrc: "https://asset.brandfetch.io/idJz-fGD_q/iddesHsUDj.svg?updated=1668517499361"
  },
  {
    name: "Postgres",
    description: "Add a Postgres catalog",
    iconSrc: "https://asset.brandfetch.io/idjSeCeMle/idZol6htuN.svg?updated=1716432965006"
  },
  {
    name: "Google Sheets",
    description: "Add a Google Sheets catalog",
    iconSrc: "https://play-lh.googleusercontent.com/keE2gN0Hqh8-Tsf_RYZ_-yS2uo6ToqYVyRBv_UZaLXsgeeHBd2YPcEUWEF4DEtfGyb1h"
  },
  {
    name: "Amazon Kinesis",
    description: "Add a Kinesis catalog",
    iconSrc: "https://trino.io/docs/current/_static/img/kinesis.png"
  },
  {
    name: "MySQL",
    description: "Add a MySQL catalog",
    iconSrc: "https://trino.io/docs/current/_static/img/mysql.png"
  },
  {
    name: "Apache Druid",
    description: "Add a Druid catalog",
    iconSrc: "https://trino.io/docs/current/_static/img/druid.png"
  },
  {
    name: "Redshift",
    description: "Add a Redshift catalog",
    iconSrc: "https://trino.io/docs/current/_static/img/redshift.png"
  }
]

interface DialogState {
  [key: string]: boolean;
}

export default function AddCatalogPage() {
  const { toast } = useToast()
  const [openDialogs, setOpenDialogs] = useState<DialogState>({})
  const org = useOrganization().organization?.id;
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, catalogName: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const credentials: { [key: string]: string } = {};
    const properties: Record<string, CatalogProperty> = {};
  
    const catalogConfig: CatalogConfig = {
      name: catalogName.toLowerCase(),
      labels: {},
      spec: {
        connector: {
          generic: {
            connectorName: catalogName.toLowerCase(),
            properties: properties
          }
        }
      }
    };
  
    formData.forEach((value, key) => {
      credentials[key] = value.toString();
      if (key.startsWith('connection-') || key.startsWith(`${catalogName.toLowerCase()}.`)) {
        properties[key] = { value: value.toString() };
      }
    });
  
    try {
      const response = await fetch('/api/catalogs/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          catalogConfig,
          secretData: credentials,
          namespace: `trino-${org}`, // You might want to make this configurable
        }),
      });
  
      if (response.ok) {
        toast({
          title: "Catalog Deployed Successfully",
          description: `Your ${catalogName} catalog has been added and deployed.`,
        });
        setOpenDialogs(prev => ({ ...prev, [catalogName]: false }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deploy catalog');
      }
    } catch (error: unknown) {
      console.error('Error deploying catalog:', error);
      let errorMessage = "There was an error deploying your catalog.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Deployment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

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
                    <img
                      src={source.iconSrc}
                      alt={`${source.name} icon`}
                      width={25}
                      height={25}
                    />
                  </div>
                  <div>
                    <CardTitle>{source.name}</CardTitle>
                    <CardDescription>{source.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogTitle>Connect {source.name}</DialogTitle>
              <DialogDescription>
              {source.name === 'Clickhouse' && (
                <form onSubmit={(e) => handleSubmit(e, source.name)}>
                  <p>Fill out your connection details to begin querying your data</p>
                  <div className="space-y-4 mt-4">
                    <Input name="connection-url" placeholder="jdbc:clickhouse://host:8123/" />
                    <Input name="connection-user" placeholder="Username" />
                    <Input name="connection-password" placeholder="Password" type="password" />
                  </div>
                  <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                </form>
              )}

              {source.name === 'Snowflake' && (
                <form onSubmit={(e) => handleSubmit(e, source.name)}>
                  <p>Fill out your connection details to begin querying your data</p>
                  <div className="space-y-4 mt-4">
                    <Input name="connection-url" placeholder="jdbc:snowflake://.snowflakecomputing.com" />
                    <Input name="connection-user" placeholder="Username" />
                    <Input name="connection-password" placeholder="Password" type="password" />
                    <Input name="snowflake.account" placeholder="Snowflake Account" />
                    <Input name="snowflake.database" placeholder="Database" />
                    <Input name="snowflake.role" placeholder="Role" />
                    <Input name="snowflake.warehouse" placeholder="Warehouse" />
                  </div>
                  <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                </form>
              )}

              {source.name === 'Postgres' && (
                <form onSubmit={(e) => handleSubmit(e, source.name)}>
                  <p>Fill out your connection details to begin querying your data</p>
                  <div className="space-y-4 mt-4">
                    <Input name="connection-url" placeholder="jdbc:postgresql://example.net:5432/database" />
                    <Input name="connection-user" placeholder="Username" />
                    <Input name="connection-password" placeholder="Password" type="password" />
                  </div>
                  <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                </form>
              )}

              {source.name === 'Google Sheets' && (
                <form onSubmit={(e) => handleSubmit(e, source.name)}>
                  <p>Fill out your connection details to begin querying your data</p>
                  <div className="space-y-4 mt-4">
                    <Input name="gsheets.credentials-path" placeholder="/path/to/google-sheets-credentials.json" />
                    <Input name="gsheets.metadata-sheet-id" placeholder="Metadata Sheet ID" />
                  </div>
                  <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                </form>
              )}

              {source.name === 'Amazon Kinesis' && (
                <form onSubmit={(e) => handleSubmit(e, source.name)}>
                  <p>Fill out your connection details to begin querying your data</p>
                  <div className="space-y-4 mt-4">
                    <Input name="kinesis.access-key" placeholder="Access Key" />
                    <Input name="kinesis.secret-key" placeholder="Secret Key" type="password" />
                  </div>
                  <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                </form>
              )}

              {source.name === 'MySQL' && (
                <form onSubmit={(e) => handleSubmit(e, source.name)}>
                  <p>Fill out your connection details to begin querying your data</p>
                  <div className="space-y-4 mt-4">
                    <Input name="connection-url" placeholder="jdbc:mysql://example.net:3306" />
                    <Input name="connection-user" placeholder="Username" />
                    <Input name="connection-password" placeholder="Password" type="password" />
                  </div>
                  <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                </form>
              )}

              {source.name === 'Apache Druid' && (
                <form onSubmit={(e) => handleSubmit(e, source.name)}>
                  <p>Fill out your connection details to begin querying your data</p>
                  <div className="space-y-4 mt-4">
                    <Input name="connection-url" placeholder="jdbc:avatica:remote:url=http://BROKER:8082/druid/v2/sql/avatica/" />
                  </div>
                  <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                </form>
              )}

              {source.name === 'Redshift' && (
                <form onSubmit={(e) => handleSubmit(e, source.name)}>
                  <p>Fill out your connection details to begin querying your data</p>
                  <div className="space-y-4 mt-4">
                    <Input name="connection-url" placeholder="jdbc:redshift://example.net:5439/database" />
                    <Input name="connection-user" placeholder="Username" />
                    <Input name="connection-password" placeholder="Password" type="password" />
                  </div>
                  <Button type="submit" className="w-full bg-black mt-4">Connect</Button>
                </form>
              )}
              </DialogDescription>
            </DialogContent>
          </Dialog>
        ))}
        <Toaster />
      </div>
    </div>
  )
 }