import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Proxy refreshes cookies for Server Components; only actions/handlers may write them.
export async function createClient(writable = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (changes) => {
        if (!writable) return;
        for (const { name, value, options } of changes) cookieStore.set(name, value, options);
      },
    },
  });
}
