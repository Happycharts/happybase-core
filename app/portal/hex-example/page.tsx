"use client"
import Link from 'next/link'
import Logo from '@/public/happybase.svg'
import { Button } from '@/components/ui/button'

export default function DemonstrationPage() {
  const hexAppUrl = "https://app.hex.tech/12709cd6-e9dc-47c3-a6b7-5ef72acfba4e/app/68f91f95-dd25-4ef8-9f12-9edce218aceb/latest"

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <iframe
        src={hexAppUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Embedded Hex App"
      />

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

      {/* Get a 14-day trial button */}
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
        <Link href="https://buy.stripe.com/test_aEU8zLaUR9uW8aQ4gh" target="_blank" rel="noopener noreferrer">
          <Button
            style={{ width: '300px', background: 'black', padding: '10px', color: 'white' }}
          >
            Get a 14-day trial
          </Button>
        </Link>
      </div>
    </div>
  )
}