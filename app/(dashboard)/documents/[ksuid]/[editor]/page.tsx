"use client"
import { SQLEditor } from '@/components/sqlEditor';
import { useSetDocumentId } from '@veltdev/react';
import React from 'react';
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';

type QueryResultRow = Record<string, string | number | boolean | null>;
type QueryResult = QueryResultRow[];

  
const App = () => {
  return (
    <div>
      <SQLEditor />
      <Toaster />
    </div>
  );
};

export default App;