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
import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { VeltPresence } from '@veltdev/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResultsArea } from "@/components/resultsArea";
import { Box } from './ui/box';
import { Input } from "@/components/ui/input";
import { File, Folder, Tree } from "@/components/ui/file-tree";

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

interface Warehouse {
  id: number;
  name: string;
  type: string;
  credentials: any;
}


export function SQLEditor() {
  const [pastQueries, setPastQueries] = useState<string[]>([]);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [query, setQuery] = useState(code);  // Initialize with 'code'
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleRunQuery = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
  
      // Log the raw response text for debugging
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
  
      // Check if the response is valid JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        setQueryResult({ error: 'Invalid JSON response from the server.' });
        setIsLoading(false);
        return;
      }
  
      setQueryResult(result);
    } catch (error) {
      console.error('Error running query:', error);
      setQueryResult({ error: 'An error occurred while running the query.' });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-grow">
        <div className="flex-grow">
          <Box className="h-full border flex-grow">
            <ScrollArea className="h-full">
              <CodeMirror
                value={query}
                onChange={(value) => setQuery(value)}
                style={{ height: "100%" }}
                extensions={[basicSetup, sql()]}
              />
            </ScrollArea>
          </Box>
        </div>

        <Box className="h-64 border-t p-4 overflow-auto">
          <div className="flex flex-row items-center space-x-4 mb-4">
            <Button className="bg-black text-white hover:bg-primary" onClick={handleRunQuery}>Run Query</Button>
          </div>
          <ResultsArea queryResult={queryResult} />
        </Box>
      </div>
    </div>
  );
}