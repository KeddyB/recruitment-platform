import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">RecruitPro</h1>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link href={user.user_metadata?.role === "employer" ? "/employer/dashboard" : "/applicant/dashboard"}>
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">Find Your Next Great Hire</h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Connect talented job seekers with amazing opportunities. Our AI-powered platform makes recruitment smarter and
          faster.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link href="/auth/sign-up">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/jobs">
            <Button size="lg" variant="outline">
              Browse Jobs
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
