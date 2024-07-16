"use client"
import { sql } from '@codemirror/lang-sql';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from "@codemirror/language";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
  rectangularSelection, crosshairCursor, lineNumbers, highlightActiveLineGutter
} from "@codemirror/view";
import { Extension, EditorState } from "@codemirror/state";
import {
  defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
  foldGutter, foldKeymap
} from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { VeltPresence } from '@veltdev/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResultsArea } from "@/components/resultsArea";
import { Box } from './ui/box';

export const basicSetup: Extension = (() => [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap
  ])
])();

const code = `-- Query external JSON API and create a new table
CREATE TABLE new_tbl AS SELECT * FROM read_json_auto('https://api.datamuse.com/words?ml=sql');
SELECT * FROM new_tbl;

-- Query a parquet file
SELECT * FROM read_parquet('stores.parquet');

-- Query a CSV file
SELECT * FROM read_csv('stores.csv');
















`;

interface QueryResult {
  data?: any[];
  error?: string | any;
  details?: any;
}

interface Source {
  id: number;
  name: string;
  type: string;
  credentials: any;
}

export function SQLEditor() {
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [query, setQuery] = useState(code);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSources = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/sources/get');
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

  const runQuery = async () => {
    if (!selectedSource) {
      setQueryResult({ error: "No source selected. Please select a data source before running the query." });
      return;
    }

    const selectedSourceObj = sources.find(source => source.id.toString() === selectedSource);
    if (!selectedSourceObj) {
      setQueryResult({ error: "The selected source could not be found. Please try selecting again." });
      return;
    }

    const sourceType = selectedSourceObj.type.toLowerCase();

    if (!['snowflake', 'clickhouse', 'postgres', 'cube'].includes(sourceType)) {
      setQueryResult({ error: "The selected source type is not supported." });
      return;
    }

    try {
      const response = await fetch(`/api/query/${sourceType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          sourceId: selectedSource
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setQueryResult({ error: result.error || `HTTP error! status: ${response.status}` });
        return;
      }

      setQueryResult(result);

      toast({
        title: "Query executed successfully",
        description: "Your query has been run and the results are displayed below.",
      });
    } catch (error) {
      console.error('Error running query:', error);
      let errorMessage = "There was an error executing your query. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setQueryResult({ error: errorMessage });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow">
        <Box className="h-full border flex-grow"> {/* Add flex-grow class here */}
          <ScrollArea className="h-full">
            <CodeMirror
              value={query}
              onChange={(value) => setQuery(value)}
              style={{ height: "100%" }}
              readOnly={false}
              extensions={[basicSetup, sql()]}
            />
          </ScrollArea>
        </Box>
      </div>

      <Box className="h-64 border-t p-4 overflow-auto"> 
      <div className="flex flex-row items-center space-x-4 mb-4"> 
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
                <SelectItem value="add" onClick={() => router.push('/sources/add')}>
                  Add a source
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button className="bg-black text-white hover:bg-primary" onClick={runQuery}>Run Query</Button>
          </div>
        <ResultsArea queryResult={queryResult} />
      </Box>
      <VeltPresence />
    </div>
  );
}