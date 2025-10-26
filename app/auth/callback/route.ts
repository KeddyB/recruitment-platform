import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(new URL(`/auth/error?error=${error}&description=${errorDescription}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?error=no_code", request.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Handle cookie setting errors
          }
        },
      },
    },
  )

  try {
    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(new URL(`/auth/error?error=${exchangeError.message}`, request.url))
    }

    // Check if user has a role set (from OAuth metadata)
    const userRole = data.user?.user_metadata?.role

    // If user has a role, redirect to their dashboard
    if (userRole === "employer") {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url))
    } else if (userRole === "applicant") {
      return NextResponse.redirect(new URL("/applicant/dashboard", request.url))
    }

    // If no role, redirect to role selection (sign up page or a new role selection page)
    return NextResponse.redirect(new URL("/auth/sign-up", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/auth/error?error=callback_error", request.url))
  }
}
