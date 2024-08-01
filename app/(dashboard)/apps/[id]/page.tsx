// /apps/[id].tsx
"use client"
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClerkSupabaseClient } from '@/app/utils/supabase/clerk';

export default function AppPage() {
  const { id } = useParams();
  const [url, setUrl] = useState('');

  useEffect(() => {
    const fetchApp = async () => {
      if (!id) return;

      const supabase = createClerkSupabaseClient();
      const { data, error } = await supabase
        .from('apps')
        .select('url')
        .eq('id', id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setUrl(data.url);
      }
    };

    fetchApp();
  }, [id]);

  return (
    <div>
      {url ? (
        <iframe
          src={url}
          style={{ width: '100%', height: '100vh', border: 'none' }}
          title="Embedded Content"
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
