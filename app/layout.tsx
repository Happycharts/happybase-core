"use client"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { Theme } from '@radix-ui/themes';
import { VeltProvider, VeltComments, VeltCommentsSidebar, VeltSidebarButton, VeltCommentTool, VeltCursor  } from '@veltdev/react';


const inter = Inter({ subsets: ["latin"], variable: "--font-sans", weight: ["400","700"] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <VeltProvider apiKey="gzMsfbG9JF8qkOB157aD">
     <VeltComments />
     <VeltCommentsSidebar />
     <VeltSidebarButton />
     <VeltCommentTool />
     <VeltCursor />
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} signInUrl="/login" signUpUrl="/sign-up">
    <html lang="en">
      <body className={inter.variable}>
      <Theme>
        {children}
      </Theme>
      </body>
    </html>
    </ClerkProvider>
    </VeltProvider>
  );
}
  