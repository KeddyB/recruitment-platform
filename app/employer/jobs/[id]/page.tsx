import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RankCandidatesButton } from "@/components/employer/rank-candidates-button"

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "employer") {
    redirect("/auth/login")
  }

  // Get job with company info
  const { data: job } = await supabase.from("jobs").select("*, companies(*)").eq("id", id).single()

  if (!job) {
    notFound()
  }

  // Verify ownership
  if (job.companies?.owner_id !== user.id) {
    redirect("/employer/dashboard")
  }

  // Get applications for this job with parsed resumes
  const { data: applications } = await supabase
    .from("applications")
    .select("*, applicants(*, parsed_resumes(*))")
    .eq("job_id", id)
    .order("applied_at", { ascending: false })

  const applicationsWithParsedResumes = applications?.filter((app) => app.applicants?.parsed_resumes?.[0]) || []

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/employer/dashboard">
            <h1 className="text-xl font-bold">RecruitPro</h1>
          </Link>
          <Link href="/employer/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold">{job.title}</h2>
              <p className="text-muted-foreground">
                {job.location} • {job.job_type}
              </p>
            </div>
            <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{job.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Salary Range</p>
                  <p className="text-sm text-muted-foreground">{job.salary_range || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Applications</p>
                  <p className="text-sm text-muted-foreground">{applications?.length || 0} received</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Posted</p>
                  <p className="text-sm text-muted-foreground">{new Date(job.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Applications</CardTitle>
                    <CardDescription>{applications?.length || 0} candidates applied</CardDescription>
                  </div>
                  {applicationsWithParsedResumes.length > 0 && <RankCandidatesButton jobId={id} />}
                </div>
              </CardHeader>
              <CardContent>
                {applications && applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="rounded-lg border p-4">
                        <h4 className="font-semibold">{app.applicants?.full_name}</h4>
                        <p className="text-sm text-muted-foreground">{app.applicants?.email}</p>
                        {app.applicants?.resume_url && (
                          <a
                            href={app.applicants.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-sm text-primary hover:underline"
                          >
                            View Resume →
                          </a>
                        )}
                        {app.applicants?.parsed_resumes?.[0] && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              Skills: {app.applicants.parsed_resumes[0].skills?.slice(0, 3).join(", ")}
                              {(app.applicants.parsed_resumes[0].skills?.length || 0) > 3 && "..."}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Experience: {app.applicants.parsed_resumes[0].experience_years} years
                            </p>
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="secondary">{app.status}</Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(app.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
