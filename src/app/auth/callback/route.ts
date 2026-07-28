import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/workspace";

  // If Supabase/Google already returned an error in URL
  if (error || error_description) {
    const errorMsg = encodeURIComponent(error_description || error || "OAuth provider error");
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error || "oauth_error")}&error_description=${errorMsg}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore if called from Server Component context
            }
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Supabase code exchange error:", exchangeError.message);
    const detailMsg = encodeURIComponent(exchangeError.message);
    return NextResponse.redirect(`${origin}/login?error=exchange_error&error_description=${detailMsg}`);
  }

  return NextResponse.redirect(`${origin}/login?error=no_code&error_description=No+authorization+code+was+provided`);
}
