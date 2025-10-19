import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResumeUploadForm } from "@/components/applicant/resume-upload-form"

export default async function ApplicantProfile() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "applicant") {
    redirect("/auth/login")
  }

  const { data: applicant } = await supabase.from("applicants").select("*").eq("user_id", user.id).single()

  if (!applicant) {
    redirect("/applicant/setup")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <h1 className="text-xl font-bold">RecruitPro</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/applicant/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="ghost">Browse Jobs</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">My Profile</h2>
            <p className="text-muted-foreground">Manage your profile information</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">{applicant.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{applicant.email}</p>
                </div>
                {applicant.phone && (
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{applicant.phone}</p>
                  </div>
                )}
                {applicant.linkedin_url && (
                  <div>
                    <p className="text-sm font-medium">LinkedIn</p>
                    <a
                      href={applicant.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
                <CardDescription>
                  {applicant.resume_url
                    ? "Your resume is uploaded. You can replace it with a new version."
                    : "Upload your resume to apply for jobs"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicant.resume_url && (
                  <div className="mb-4">
                    <a
                      href={applicant.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Current Resume →
                    </a>
                  </div>
                )}
                <ResumeUploadForm applicantId={applicant.id} userId={user.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
