"use client"
import { useState, useEffect } from "react";
import { sql } from '@codemirror/lang-sql';
import CodeMirror, { gutter } from '@uiw/react-codemirror';
import { StreamLanguage } from "@codemirror/language";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor, rectangularSelection, crosshairCursor, lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
import { Extension, EditorState } from "@codemirror/state";
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching, foldGutter, foldKeymap } from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const basicSetup: Extension = (() => [
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
    ...lintKeymap,
  ]),
])();

const minimalSetup: Extension = (() => [
  highlightSpecialChars(),
  history(),
  drawSelection(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap,
  ]),
])();

const placeholderQuery = `-- Query external JSON API and create a new table
CREATE TABLE new_tbl AS SELECT * FROM read_json_auto('https://api.datamuse.com/words?ml=sql');
SELECT * FROM new_tbl;

-- Query a parquet file
SELECT * FROM read_parquet('stores.parquet');

-- Query a CSV file
SELECT * FROM read_csv('stores.csv');
`;

export default function SQLEditor() {
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [sources, setSources] = useState<{ id: number; name: string; type: string; }[]>([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [query, setQuery] = useState("");
  const [savedQueries, setSavedQueries] = useState<{ id: number; query: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchSources();
    loadSavedQueries();
  }, []);

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/fetch-sources');
      if (!response.ok) throw new Error('Failed to fetch sources');
      const { data } = await response.json();
      setSources(data);
    } catch (error) {
      console.error('Error fetching sources:', error);
      toast({ title: "Error", description: "Failed to fetch data sources.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedQueries = () => {
    const saved = localStorage.getItem('savedQueries');
    if (saved) setSavedQueries(JSON.parse(saved));
  };

  const saveQuery = () => {
    if (!query.trim()) {
      toast({ title: "Error", description: "Query is empty.", variant: "destructive" });
      return;
    }
    const updatedQueries = [...savedQueries, { id: Date.now(), query }];
    setSavedQueries(updatedQueries);
    localStorage.setItem('savedQueries', JSON.stringify(updatedQueries));
    toast({ title: "Success", description: "Query saved successfully." });
  };

  const runQuery = async () => {
    if (!selectedSource) {
      toast({ title: "No source selected", description: "Please select a data source before running the query.", variant: "destructive" });
      return;
    }
    if (!query.trim()) {
      toast({ title: "Error", description: "Query is empty.", variant: "destructive" });
      return;
    }

    setIsQueryLoading(true);
    try {
      const selectedSourceObj = sources.find(source => source.id.toString() === selectedSource);
      if (!selectedSourceObj) throw new Error("Source not found");

      const sourceType = selectedSourceObj.type.toLowerCase();
      if (!['snowflake', 'clickhouse', 'postgres'].includes(sourceType)) {
        throw new Error("Invalid source type");
      }

      const response = await fetch(`/api/query/${sourceType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, sourceId: selectedSource }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      setQueryResult(result);
      setShowResults(true);
      toast({ title: "Success", description: "Query executed successfully." });
    } catch (error) {
      console.error('Error running query:', error);
      if (error instanceof Error) {
        toast({ title: "Error", description: error.message || "There was an error executing your query.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "There was an error executing your query.", variant: "destructive" });
      }
    } finally {
      setIsQueryLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 space-y-4">
      <div className="flex flex-wrap justify-between items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Select value={selectedSource} onValueChange={setSelectedSource}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={isLoading ? "Loading..." : "Select a source"} />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading">Loading...</SelectItem>
            ) : sources.length > 0 ? (
              sources.map((source: { id: number; name: string; type: string; }) => (
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
        <div className="flex space-x-2">
          <Button onClick={saveQuery}>Save Query</Button>
          <Button className="bg-black" onClick={runQuery} disabled={isQueryLoading}>
            {isQueryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Run Query
          </Button>
        </div>
      </div>
      <div className="flex-grow">
        <ScrollArea className="h-full border rounded-md">
          <CodeMirror
            value={query}
            onChange={setQuery}
            height="100%"
            extensions={[basicSetup, sql()]}
            className="min-h-[300px]"
          />
        </ScrollArea>
      </div>
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Query Results</DialogTitle>
          </DialogHeader>
          {queryResult && (
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(queryResult[0] || {}).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryResult.map((row: { id: number; [key: string]: any; }, index: number) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value: any, cellIndex) => (
                      <TableCell key={cellIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
