/**
 * Server-only session helper. Reads user and session (no cookie writes).
 * Cookie updates (e.g. refresh) must run in Server Actions or Route Handlers.
 */
import { createClient } from "@/lib/supabase/server";

export type ServerSession = {
  user: { id: string } | null;
  session: { access_token: string } | null;
  token: string;
};

export async function getServerSession(): Promise<ServerSession> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";
  return { user: user ?? null, session: session ?? null, token };
}
