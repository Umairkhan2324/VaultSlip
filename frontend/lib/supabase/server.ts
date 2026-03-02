import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client for App Router layouts/pages.
// We only provide read-only cookie access here; token refresh and writes
// should be handled by Next.js middleware or dedicated Server Actions.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // No-op setter to avoid calling cookies().set() from RSC/layouts,
        // which is disallowed in Next.js 13+/16 App Router.
        setAll() {
          // intentionally left blank; writes should happen in a Route Handler or Server Action
        },
      },
    }
  );
}
