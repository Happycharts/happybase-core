import React, { useState, useEffect } from "react";
import { cn } from "@/app/utils/utils";
import { EditorBubbleItem, useEditor } from "novel";
import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Source {
  id: number;
  name: string;
  type: string;
  credentials: any;
}

export const QueryButton: React.FC = () => {
  const { editor } = useEditor();
  const { toast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
        if (data.length > 0) {
          setSelectedSource(data[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching sources:', error);
        toast({
          title: "Error fetching sources",
          description: "Unable to load data sources. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSources();
  }, [toast]);

  const executeCode = async () => {
    if (!editor) return;

    const { state } = editor;
    const { from, to } = state.selection;
    const selectedText = state.doc.textBetween(from, to);
    
    if (!selectedSource) {
      toast({
        title: "No source selected",
        description: "Please select a data source before running the query.",
        variant: "destructive",
      });
      return;
    }

    const selectedSourceObj = sources.find(source => source.id.toString() === selectedSource);
    if (!selectedSourceObj) {
      toast({
        title: "Source not found",
        description: "The selected source could not be found. Please try selecting again.",
        variant: "destructive",
      });
      return;
    }

    const sourceType = selectedSourceObj.type.toLowerCase();
    
    if (!['snowflake', 'clickhouse', 'postgres'].includes(sourceType)) {
      toast({
        title: "Invalid source type",
        description: "The selected source type is not supported.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/query/${sourceType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: selectedText,
          sourceId: selectedSource
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Insert the result below the selected code block
      editor.chain().focus().insertContentAt(to, `\n\nResult:\n${JSON.stringify(result, null, 2)}`).run();

      toast({
        title: "Query executed successfully",
        description: "Your query has been run and the results are displayed below the code block.",
      });
    } catch (error) {
      console.error('Error running query:', error);
      toast({
        title: "Error running query",
        description: "There was an error executing your query. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!editor || isLoading) return null;

  const items = [
    {
      name: "Execute Code",
      icon: PlayIcon,
      command: executeCode,
      isActive: () => false,
    },
  ];

  return (
    <div className="flex items-center">
      {items.map((item, index) => (
        <EditorBubbleItem
          key={index}
          onSelect={item.command}
        >
          <Button size="sm" className="rounded-none" variant="ghost">
            <item.icon
              className={cn("h-4 w-4", {
                "text-blue-500": item.isActive(),
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};