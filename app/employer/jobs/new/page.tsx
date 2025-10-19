import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { JobPostingForm } from "@/components/employer/job-posting-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewJobPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "employer") {
    redirect("/auth/login")
  }

  // Get company
  const { data: company } = await supabase.from("companies").select("*").eq("owner_id", user.id).single()

  if (!company) {
    redirect("/employer/setup")
  }

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
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Post a New Job</h2>
            <p className="text-muted-foreground">Fill in the details to create a new job posting</p>
          </div>
          <JobPostingForm companyId={company.id} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
