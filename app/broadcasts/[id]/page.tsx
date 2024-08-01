"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClerkSupabaseClient } from '@/app/utils/supabase/clerk'
import { useUser } from '@clerk/nextjs';
import Logo from '@/public/happybase.svg'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function BroadcastPage() {
  const [broadcast, setBroadcast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState('')
  const { user } = useUser();
  const params = useParams()
  const { id } = params

  useEffect(() => {
    const fetchBroadcast = async () => {
      if (!id) {
        console.error('ID is not provided')
        setLoading(false)
        return
      }

      console.log('Fetching broadcast with ID:', id)

      const supabase = createClerkSupabaseClient()
      const { data, error } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching broadcast:', error)
        setLoading(false)
        return
      }

      if (!data) {
        console.error('Broadcast not found')
        setLoading(false)
        return
      }

      setBroadcast(data)
      setUrl(data.url) // Ensure that the URL is correctly set from the data
      setLoading(false)
    }

    fetchBroadcast()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!broadcast) return <div>Broadcast not found</div>

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {url ? (
        <iframe
          src={url}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Embedded Content"
        />
      ) : (
        <p>App URL not found</p>
      )}

      {/* Powered by Happybase widget */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <span className='mr-2'>Powered by Happybase</span>
        <Logo />
      </div>

      {/* Hovering link input */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <p style={{ marginBottom: '5px' }}>Want to query? Request an access key</p>
        <Button
          style={{ width: '300px', background: 'black', padding: '5px', color: 'white' }}
        >
          Request an Access Key
        </Button>
      </div>
    </div>
  )
}
