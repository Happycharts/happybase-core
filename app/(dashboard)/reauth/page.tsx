import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

const ReauthPage = () => {
  const router = useRouter();

  useEffect(() => {
    const refreshOnboarding = async () => {
      try {
        // Assuming you have the account ID stored somewhere, e.g., in localStorage
        const accountId = localStorage.getItem('stripeAccountId');

        if (!accountId) {
          throw new Error('Account ID not found');
        }

        const accountLink = await stripe.accountLinks.create({
          account: accountId,
          refresh_url: 'https://app.happybase.co/reauth',
          return_url: 'https://app.happybase.com/onboarding-success',
          type: 'account_onboarding',
        });

        // Redirect the user to the new onboarding link
        window.location.href = accountLink.url;
      } catch (error) {
        console.error('Error refreshing onboarding link:', error);
        // Handle the error, e.g., show an error message to the user
      }
    };

    refreshOnboarding();
  }, []);

  return (
    <div>
      <h1>Refreshing Onboarding...</h1>
      <p>Please wait while we refresh your onboarding link.</p>
    </div>
  );
};

export default ReauthPage;
