'use server';

import { createStreamableUI, createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { generateText } from 'ai';
import { ReactNode } from 'react';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/app/utils/supabase/server';
import { BarChart, CartesianGrid,XAxis, YAxis,Tooltip, Legend, Bar, } from 'recharts';
import { ClickHouseClient, createClient as createClickHouseClient } from '@clickhouse/client';
import CryptoJS from 'crypto-js';
import { createOpenAI } from '@ai-sdk/openai';
import { text } from 'stream/consumers';
import { v4 as uuidv4, validate as uuidValidate, validate } from 'uuid';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  charts?: string[];
};

type ConnectToDatabaseResult = {
  type: 'tool-result';
  toolCallId: string; 
  toolName: 'connectToDatabase';
  args: {
    credentials: string;
  };
  result: ClickHouseClient;
};

type FetchSchemaResult = {
  type: 'tool-result';
  toolCallId: string;
  toolName: 'fetchSchema';
  args: {
    sourceId: string;
    client?: any;
  };
  result: {
    tables: string[];
    columns: { [key: string]: string[] };
  };
};

type CreateQueryResult = {
  type: 'tool-result';
  toolCallId: string;
  toolName: 'createQuery';
  args: {
    schema: string;
    query: string;
    credentials: { url: string; username: string; password: string; database: string };
  };
  result: {
    columns: string[];
    rows: unknown[];
    rowCount: number;
  };
};

type InitBarChartResult = {
  type: 'tool-result';
  toolCallId: string;
  toolName: 'initBarChart';
  args: {
    data: Array<Record<string, number>>;
    xAxisKey: string;
    yAxisKeys: string[];
  };
  result: any; // Adjust this type based on what your initBarChart actually returns
};

type ToolResult = ConnectToDatabaseResult | FetchSchemaResult | CreateQueryResult | InitBarChartResult;

export async function AIChat(conversation: { role: string; content: string }[], org: { id: string }, input: string, prompt: string): Promise<{ text: string; charts: (string | null)[] }> {
  const supabase = createClient();
  const organizationId = auth().orgId;

  const { data, error } = await supabase
  .from('sources')
  .select('credentials')
  .eq('id', "organization")
  .single();

  const sourceId = data?.credentials.sourceId;
  const credentials = data?.credentials;

  if (error) throw error;
  if (!data) throw new Error('No source found');


  const barChartSchema = z.object({
    barChart: z.object({
      description: z.string(),
      parameters: z.object({
        data: z.array(z.record(z.string(), z.number()).describe('The data point')).describe('The data to plot'),
        xAxisKey: z.string().describe('The key of the x-axis'),
        yAxisKeys: z.array(z.string()).describe('The keys of the y-axis'),
      }),
    }),
  });

  const { text, toolResults } = await generateText({
    model: anthropic('claude-3-haiku-20240307'),
    system: 'You are a helpful BI assistant. Use the provided tools to analyze data and create visualizations.',
    prompt: prompt,
    tools: {
      connectToDatabase: {
        description: 'Connect to a database for the given organization.',
        parameters: z.object({
          organizationId: z.string().describe('The ID of the organization'),
          sourceId: z.string().describe('The ID of the source'),
          credentials: z.string().describe('The credentials for the database'),
        }),
        execute: async ({ credentials }) => {

          try {
            console.log('Source ID:', sourceId); // Log the value of sourceId
            console.log('Data:', data); // Log the fetched data
          
            const client = createClickHouseClient({
              url: credentials.url,
              username: credentials.username,
              password: credentials.password,
              database: credentials.database,
            });
          
            return client;
          } catch (error) {
            console.error(error);
            throw error;
          }
          
        },
      },
      fetchSchema: {
        description: 'Fetch the schema for the connected database.',
        parameters: z.object({
          organizationId: z.string().describe('The ID of the organization'),
          sourceId: z.string().describe('The ID of the data source'),
          client: z.any().describe('The ClickHouse client'),
        }),

        execute: async ({ client }: { client: any }) => {
          try {
            // Fetch tables
            const tablesResult = await client.query({
              query: 'SHOW TABLES',
              format: 'JSONEachRow',
            });
            const tables = await tablesResult.json();

            // Fetch columns for each table
            const schema: { tables: string[], columns: { [key: string]: string[] } } = {
              tables: [],
              columns: {},
            };

            for (const table of tables) {
              const tableName = (table as { name: string }).name;
              schema.tables.push(tableName);

              const columnsResult = await client.query({
                query: `DESCRIBE TABLE ${tableName}`,
                format: 'JSONEachRow',
              });
              const columns = await columnsResult.json();

              schema.columns[tableName] = columns.map((col: unknown) => (col as { name: string }).name);
            }

            return schema;
          } catch (error) {
            console.error('Error fetching schema:', error);
            throw new Error(`Failed to fetch schema: ${(error as Error).message}`);
          } finally {
            await client.close();
          }
        },
      },
      createQuery: {
        description: 'Create and execute a query on the connected ClickHouse database.',
        parameters: z.object({
          organizationId: z.string().describe('The ID of the organization'),
          query: z.string().describe('The SQL query to execute'),
          schema: z.string().describe('The schema for the database'),
          credentials: z.object({
            url: z.string(),
            username: z.string(),
            password: z.string(),
            database: z.string(),
          }).describe('The credentials for the database'),
        }),

        execute: async ({ query, credentials, schema }: { query: string, credentials: { url: string, username: string, password: string, database: string }, schema: string }) => {
          const client = createClickHouseClient({
            url: credentials.url,
            username: credentials.username,
            password: credentials.password,
            database: credentials.database,
          });

          try {
            // Execute the query
            const result = await client.query({
              query,
              format: 'JSONEachRow',
            });

            // Parse the result
            const rows = await result.json();

            // Get column names from the first row
            const columns = rows.length > 0 ? Object.keys(rows[0] as object) : [];

            return {
              columns,
              rows,
              rowCount: rows.length,
            };
          } catch (error) {
            console.error('Error executing query:', error);
            throw new Error(`Failed to execute query: ${(error as Error).message}`);
          } finally {
            await client.close();
          }
        },
      },
      initBarChart: {
        description: 'Initialize a bar chart',
        parameters: z.object({
          data: z.array(z.record(z.string(), z.number()).describe('The data point')).describe('The data to plot'),
          xAxisKey: z.string().describe('The key of the x-axis'),
          yAxisKeys: z.array(z.string()).describe('The keys of the y-axis'),
        }),
        execute: async ({ data, xAxisKey, yAxisKeys }) => {
          // Implementation of bar chart initialization
          // Return the chart data or component
        },
      },
    }, // Close the tools object
  }); // Close the generateText function call

  const charts = toolResults.map((result: ToolResult, index: number): string | null => {
    switch (result.toolName) {
      case 'createQuery':
        if (result.result.columns && result.result.rows) {
          const data = result.result.rows.map((row: any) => {
            const dataPoint: { [key: string]: number | string } = {};
            result.result.columns.forEach((column: string, index: number) => {
              dataPoint[column] = row[index];
            });
            return dataPoint;
          });
          const xAxisKey = result.result.columns[0];
          const yAxisKeys = result.result.columns.slice(1);
  
          return `
            <BarChart
              width={600}
              height={300}
              data={${JSON.stringify(data)}}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="${xAxisKey}" />
              <YAxis />
              <Tooltip />
              <Legend />
              ${yAxisKeys.map((key) => `
                <Bar dataKey="${key}" fill="#8884d8" key="bar-${index}-${key}" />
              `).join('')}
            </BarChart>
          `;
        }
        return null;
      case 'initBarChart':
        // Handle initBarChart result
        // You might want to return a chart component or data here
        return null;
      default:
        return null;
    }
  }).filter(Boolean); // Remove any null results
  return { text, charts };
}