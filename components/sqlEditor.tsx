"use client"
import { sql } from '@codemirror/lang-sql';
import CodeMirror, { gutter } from '@uiw/react-codemirror';
import { StreamLanguage } from "@codemirror/language";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
    rectangularSelection, crosshairCursor,
    lineNumbers, highlightActiveLineGutter} from "@codemirror/view"
import {Extension, EditorState} from "@codemirror/state"
import {defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
    foldGutter, foldKeymap} from "@codemirror/language"
import {defaultKeymap, history, historyKeymap} from "@codemirror/commands"
import {searchKeymap, highlightSelectionMatches} from "@codemirror/search"
import {autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap} from "@codemirror/autocomplete"
import {lintKeymap} from "@codemirror/lint"
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast"

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
    syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
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
  ])()

  export const minimalSetup: Extension = (() => [
    highlightSpecialChars(),
    history(),
    drawSelection(),
    syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
    ])
  ])()

const code = `-- Query external JSON API and create a new table
CREATE TABLE new_tbl AS SELECT * FROM read_json_auto('https://api.datamuse.com/words?ml=sql');
SELECT * FROM new_tbl;

-- Query a parquet file
SELECT * FROM read_parquet('stores.parquet');

-- Query a CSV file
SELECT * FROM read_csv('stores.csv');
`;

export default function SQLEditor() {
  interface Source {
    id: number;
    name: string;
    type: string;
    credentials: any;
    // add other properties if necessary
  }
  const [queryResult, setQueryResult] = useState(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [query, setQuery] = useState(code);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast()

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

  const runQuery = async () => {
    if (!selectedSource) {
      toast({
        title: "No source selected",
        description: "Please select a data source before running the query.",
        variant: "destructive",
      })
      return;
    }

    const selectedSourceObj = sources.find(source => source.id.toString() === selectedSource);
    if (!selectedSourceObj) {
      toast({
        title: "Source not found",
        description: "The selected source could not be found. Please try selecting again.",
        variant: "destructive",
      })
      return;
    }

    const sourceType = selectedSourceObj.type.toLowerCase();
    
    if (!['snowflake', 'clickhouse', 'postgres'].includes(sourceType)) {
      toast({
        title: "Invalid source type",
        description: "The selected source type is not supported.",
        variant: "destructive",
      })
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setQueryResult(result);

      toast({
        title: "Query executed successfully",
        description: "Your query has been run and the results are displayed below.",
      })
    } catch (error) {
      console.error('Error running query:', error);
      toast({
        title: "Error running query",
        description: "There was an error executing your query. Please try again.",
        variant: "destructive",
      })
    }
  };
  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-start items-center p-4 space-x-4">
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
        <Button className="bg-black" onClick={runQuery}>Run Query</Button>
      </div>
      <div className="h-full">
        <ScrollArea className="h-full">
          <CodeMirror
            value={query}
            onChange={(value) => setQuery(value)}
            height="500px"
            readOnly={false}
            extensions={[basicSetup, sql()]}
          />
        </ScrollArea>
      </div>
      {queryResult && (
        <div className="mt-4">
          <h3>Query Result:</h3>
          <pre>{JSON.stringify(queryResult, null, 2)}</pre>
        </div>
      )}
  </div>
);
}