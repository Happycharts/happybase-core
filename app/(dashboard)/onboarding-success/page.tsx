"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const OnboardingSuccessPage = () => {
  const router = useRouter();

  useEffect(() => {
    // You can add any additional logic here, e.g., updating the user's status in your database
  }, []);

  return (
    <div>
      <h1>Onboarding Successful!</h1>
      <p>Thank you for completing the onboarding process. You can now start using our services.</p>
      <Button onClick={() => router.push('/')}>Go to Dashboard</Button>
    </div>
  );
};

export default OnboardingSuccessPage;