import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { localAdminEnabled } from "@/lib/auth/policy";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (localAdminEnabled(process.env)) {
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: changes => {
          for (const { name, value } of changes) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of changes) response.cookies.set(name, value, options);
        },
      } },
    );
    try { await client.auth.getClaims(); } catch { /* Page/action guards fail closed. */ }
  }
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
