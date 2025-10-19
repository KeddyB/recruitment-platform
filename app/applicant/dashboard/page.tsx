import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ApplicantDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "applicant") {
    redirect("/auth/login")
  }

  const { data: applicant, error } = await supabase.from("applicants").select("*").eq("user_id", user.id).maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error fetching applicant:", error)
  }

  if (!applicant) {
    redirect("/applicant/setup")
  }

  // Get applications
  const { data: applications } = await supabase
    .from("applications")
    .select("*, jobs(*, companies(name))")
    .eq("applicant_id", applicant.id)
    .order("applied_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <h1 className="text-xl font-bold">RecruitPro</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/jobs">
              <Button variant="ghost">Browse Jobs</Button>
            </Link>
            <Link href="/applicant/profile">
              <Button variant="ghost">My Profile</Button>
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
            <h2 className="text-3xl font-bold">My Applications</h2>
            <p className="text-muted-foreground">Welcome back, {applicant.full_name}</p>
          </div>
          <Link href="/jobs">
            <Button size="lg">Browse Jobs</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{applications?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {applications?.filter((a) => a.status === "pending").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Reviewing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {applications?.filter((a) => a.status === "reviewing").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {applications?.filter((a) => a.status === "shortlisted").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Applications</CardTitle>
            <CardDescription>Track the status of your job applications</CardDescription>
          </CardHeader>
          <CardContent>
            {applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{app.jobs?.title}</h3>
                        <p className="text-sm text-muted-foreground">{app.jobs?.companies?.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {app.jobs?.location} • Applied {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          app.status === "shortlisted"
                            ? "default"
                            : app.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">You haven&apos;t applied to any jobs yet.</p>
                <Link href="/jobs">
                  <Button className="mt-4">Browse Jobs</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
