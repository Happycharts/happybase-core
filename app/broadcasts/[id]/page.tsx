"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { createClerkSupabaseClient } from '@/app/utils/supabase/clerk'
import Logo from '@/public/happybase.svg'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUser, useOrganization } from '@clerk/nextjs';
import { Resend } from 'resend';
import { HappybaseInviteUserEmail } from '@/app/utils/email-templates/invite'; // Import the email template

export default function BroadcastPage() {
  const [broadcast, setBroadcast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [url, setUrl] = useState('')
  const [inviteeEmail, setInviteeEmail] = useState(''); 
  const [inviteLink, setInviteLink] = useState(''); // New state for invite link
  const { user } = useUser();
  const params = useParams()
  const { id } = params
  const { organization } = useOrganization();

  useEffect(() => {
    let isMounted = true;
    const fetchInviteLink = async () => {
      if (!user?.id || !organization?.id) return;

      const supabase = createClerkSupabaseClient();
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organization.id);

      if (error) {
        console.error(error);
      } else if (data && data.length > 0) {
        if (isMounted) {
          setInviteLink(data[0].inviteLink);
        }
      }
    };

    fetchInviteLink();

    return () => {
      isMounted = false;
    };
  }, [user?.id, organization?.id]);

  useEffect(() => {
    if (organization) {
      setCompanyName(organization.name);
      setCompanyLogo(organization.imageUrl);
    }
  }, [organization]);

  const handleRequestQuote = async () => {
    if (!inviteeEmail) {
      alert('Please enter an email address');
      return;
    }

    const resend = new Resend('re_Rh8CFXtP_EfbsvjFU8ikD2MpxjnGg9sBq');

    const invitedByName = user?.fullName || 'User';
    const invitedByEmail = user?.emailAddresses[0].emailAddress || 'user@example.com';

    const emailContent = HappybaseInviteUserEmail({
      name: invitedByName,
      logo: companyLogo,
      invitedByName,
      invitedByEmail,
      companyName,
      inviteeLogo: companyLogo, // Assuming invitee logo is the same as company logo
      inviteeEmail,
      inviteLink, // Use the state variable here
    });

    const { data, error } = await resend.emails.send({
      from: 'James <onboarding@happybase.co>',
      to: [inviteeEmail],
      subject: `You're invited to a 30-min data access consultation with ${companyName}`,
      react: emailContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    console.log('Email sent successfully:', data);
  };

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
        <p style={{ marginBottom: '5px' }}>Want to query? Request an access quote</p>
        <Input
          type="email"
          placeholder="Enter your email"
          value={inviteeEmail}
          onChange={(e) => setInviteeEmail(e.target.value)}
          style={{ marginBottom: '10px', width: '300px' }}
        />
        <Button
          style={{ width: '300px', background: 'black', padding: '5px', color: 'white' }}
          onClick={handleRequestQuote}
        >
          Request an access quote
        </Button>
      </div>
    </div>
  )
}
