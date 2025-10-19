import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Build query for active jobs
  let query = supabase
    .from("jobs")
    .select("*, companies(name, logo_url)")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  // Apply search filter if provided
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
  }

  const { data: jobs } = await query

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <h1 className="text-xl font-bold">RecruitPro</h1>
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link href={user.user_metadata?.role === "employer" ? "/employer/dashboard" : "/applicant/dashboard"}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              </>
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

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Browse Jobs</h2>
          <p className="text-muted-foreground">Find your next opportunity</p>
        </div>

        {/* Search */}
        <form method="get" className="mb-8">
          <div className="flex gap-4">
            <Input
              name="search"
              type="search"
              placeholder="Search by title, description, or location..."
              defaultValue={search}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </div>
        </form>

        {/* Job Listings */}
        <div className="grid gap-6">
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription className="mt-1">{job.companies?.name}</CardDescription>
                      </div>
                      <Badge>{job.job_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{job.location}</span>
                      {job.salary_range && <span>• {job.salary_range}</span>}
                      <span>• Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {search ? "No jobs found matching your search." : "No jobs available at the moment."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
