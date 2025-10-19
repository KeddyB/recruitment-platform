import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function EmployerDashboard() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "employer") {
    redirect("/auth/login")
  }

  // Check if employer has a company
  const { data: company } = await supabase.from("companies").select("*").eq("owner_id", user.id).single()

  // If no company, redirect to setup
  if (!company) {
    redirect("/employer/setup")
  }

  // Get jobs for this company
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, applications(count)")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })

  const activeJobs = jobs?.filter((job) => job.status === "active") || []
  const totalApplications = jobs?.reduce((sum, job) => sum + (job.applications?.[0]?.count || 0), 0) || 0

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <h1 className="text-xl font-bold">RecruitPro</h1>
            </Link>
            <Badge variant="secondary">{company.name}</Badge>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/employer/jobs">
              <Button variant="ghost">My Jobs</Button>
            </Link>
            <Link href="/employer/company">
              <Button variant="ghost">Company Profile</Button>
            </Link>
            <form action="/auth/login" method="post">
              <Button variant="ghost" type="submit">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">Welcome back, {user.user_metadata?.company_name || "there"}</p>
          </div>
          <Link href="/employer/jobs/new">
            <Button size="lg">Post a Job</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeJobs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{jobs?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
            <CardDescription>Your most recently posted jobs and their application counts</CardDescription>
          </CardHeader>
          <CardContent>
            {jobs && jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.slice(0, 5).map((job) => (
                  <Link key={job.id} href={`/employer/jobs/${job.id}`} className="block">
                    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted">
                      <div className="flex-1">
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {job.location} • {job.job_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium">{job.applications?.[0]?.count || 0} applications</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No jobs posted yet. Create your first job posting to get started!
                </p>
                <Link href="/employer/jobs/new">
                  <Button className="mt-4">Post Your First Job</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
