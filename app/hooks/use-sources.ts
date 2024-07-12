// hooks/useSources.ts
import { useState, useEffect } from 'react';
import { createClient } from "@/app/utils/supabase/client";

interface Source {
  id: number;
  name: string;
  // Add other properties as needed
}

export function useSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSources() {
      setIsLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('sources').select('*');
        if (error) throw error;
        setSources(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSources();
  }, []);

  return { sources, isLoading, error };
}