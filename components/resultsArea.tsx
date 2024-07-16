import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";

interface QueryResult {
    data?: any[];
    error?: string | any; // specify the type of error here
    details?: any;
  }

  
export function ResultsArea({ queryResult }: { queryResult: QueryResult | null }) {
    if (!queryResult) {
      return <p className="text-gray-400">No results to display. Run a query to see results here.</p>;
    }
  
    if (queryResult.error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {queryResult.error}</span>
          {queryResult.details && (
            <div className="mt-2">
              <strong className="font-bold">Details:</strong>
              <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(queryResult.details, null, 2)}</pre>
            </div>
          )}
        </div>
      );
    }
  
    if (!queryResult.data || queryResult.data.length === 0) {
      return <p>No results returned from the query.</p>;
    }
  
    return (
      <ScrollArea className="h-full">
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(queryResult.data[0]).map((key: string) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {queryResult.data.map((row: any, index: number) => (
              <TableRow key={index}>
                {Object.values(row).map((value: any, cellIndex: number) => (
                  <TableCell key={cellIndex}>{String(value)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  }