"use client";
import { createClient } from "@supabase/supabase-js";

declare global {
  interface Window {
    Clerk: any;
  }
}

export function createClerkSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("This function should only be used in the browser");
  }

  console.log("Creating Supabase client with URL:", process.env.NEXT_PUBLIC_SUPABASE_URL!);
  console.log("Creating Supabase client with Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          // Wait for Clerk to initialize
          await window.Clerk?.load();

          let clerkToken;
          try {
            clerkToken = await window.Clerk.session?.getToken({
              template: "supabase",
            });
          } catch (error) {
            console.error("Failed to get Clerk token:", error);
          }

          // Construct fetch headers
          const headers = new Headers(options?.headers);
          if (clerkToken) {
            headers.set("Authorization", `Bearer ${clerkToken}`);
          }

          // Now call the default fetch
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}