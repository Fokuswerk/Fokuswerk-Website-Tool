import { createBrowserClient } from "@supabase/ssr";

// Nutzt createBrowserClient damit die Session (Cookie-basiert) mit dem
// Login-Flow (@supabase/ssr) geteilt wird — ohne dies ist auth.uid() = null
// und RLS-Policies für authenticated schlagen fehl.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
