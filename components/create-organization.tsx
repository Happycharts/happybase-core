"use client"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { CreateOrganization, SignUp, useOrganization } from "@clerk/nextjs"
import { cn } from "@/app/utils/utils"
import Logo from "@/public/happybase.svg"
import { Shield, Zap, TrendingUp } from "lucide-react"
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsBrowser } from '@segment/analytics-next'
import { useUser } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
}

interface FeatureItemProps {
    icon: ReactNode;
    title: string;
    description: string;
}

function CustomCreateOrganization() {
  const { organization, isLoaded } = useOrganization();
  const router = useRouter();
  const analytics = AnalyticsBrowser.load({ writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY! });
  const { user } = useUser();

  analytics.identify(user?.id!, {
    name: user?.fullName,
    email: user?.emailAddresses[0]?.emailAddress,
  });
  useEffect(() => {
    if (isLoaded && organization) {
      // Organization has been created, call the API
      fetch('/api/merchants/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId: organization.id,
          name: organization.name,
          website: '' // You might want to add a field for this in your organization creation form
        }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.onboardingLink) {
          // Redirect to the Stripe onboarding link
          router.push(data.onboardingLink);
        } else {
          // Redirect to the default URL
          router.push('https://buy.stripe.com/cN27uf2B1gFagYofYY');
        }
      })
      .catch(error => {
        console.error('Error creating merchant account:', error);
        // Redirect to the default URL even if there's an error
        router.push('https://buy.stripe.com/cN27uf2B1gFagYofYY');
      });
    }
  }, [isLoaded, organization, router]);

  

  return (
    <CreateOrganization path="/auth/create-organization" />
  );
}

export default function AuthenticationPage() {
  return (
    <div className="container bg-black relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* ... (previous code remains unchanged) ... */}
      <div className="bg-black lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <CustomCreateOrganization />
          <p className="px-8 text-center text-sm text-white">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
   return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 p-2 bg-primary text-black rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-xl text-black font-semibold mb-2">{title}</h3>
        <p className="text-black">{description}</p>
      </div>
    </div>
  )
}