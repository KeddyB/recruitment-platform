import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get job details
  const { data: job } = await supabase.from("jobs").select("*, companies(*)").eq("id", id).single()

  if (!job) {
    notFound()
  }

  // Check if user has already applied (if logged in as applicant)
  let hasApplied = false
  if (user && user.user_metadata?.role === "applicant") {
    const { data: applicant } = await supabase.from("applicants").select("id").eq("user_id", user.id).single()

    if (applicant) {
      const { data: application } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", id)
        .eq("applicant_id", applicant.id)
        .single()

      hasApplied = !!application
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <h1 className="text-xl font-bold">RecruitPro</h1>
          </Link>
          <Link href="/jobs">
            <Button variant="ghost">Back to Jobs</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold">{job.title}</h2>
                <p className="mt-2 text-xl text-muted-foreground">{job.companies?.name}</p>
              </div>
              <Badge>{job.job_type}</Badge>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <span>{job.location}</span>
              {job.salary_range && <span>• {job.salary_range}</span>}
              <span>• Posted {new Date(job.created_at).toLocaleDateString()}</span>
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
                  <CardTitle>About the Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="mb-2 font-semibold">{job.companies?.name}</h3>
                  <p className="text-sm text-muted-foreground">{job.companies?.description}</p>
                  {job.companies?.website && (
                    <a
                      href={job.companies.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-sm text-primary hover:underline"
                    >
                      Visit website →
                    </a>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  {user ? (
                    user.user_metadata?.role === "applicant" ? (
                      hasApplied ? (
                        <Button className="w-full" disabled>
                          Already Applied
                        </Button>
                      ) : (
                        <Link href={`/jobs/${id}/apply`}>
                          <Button className="w-full">Apply Now</Button>
                        </Link>
                      )
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">Sign up as a job seeker to apply</p>
                    )
                  ) : (
                    <div className="space-y-2">
                      <Link href="/auth/sign-up">
                        <Button className="w-full">Sign up to Apply</Button>
                      </Link>
                      <Link href="/auth/login">
                        <Button variant="outline" className="w-full bg-transparent">
                          Log in
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
