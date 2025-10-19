import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ApplicationForm } from "@/components/applicant/application-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "applicant") {
    redirect("/auth/login")
  }

  // Get applicant profile
  const { data: applicant } = await supabase.from("applicants").select("*").eq("user_id", user.id).single()

  if (!applicant) {
    redirect("/applicant/setup")
  }

  // Get job details
  const { data: job } = await supabase.from("jobs").select("*, companies(name)").eq("id", id).single()

  if (!job) {
    notFound()
  }

  // Check if already applied
  const { data: existingApplication } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", id)
    .eq("applicant_id", applicant.id)
    .single()

  if (existingApplication) {
    redirect(`/jobs/${id}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <h1 className="text-xl font-bold">RecruitPro</h1>
          </Link>
          <Link href={`/jobs/${id}`}>
            <Button variant="ghost">Back to Job</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Apply for {job.title}</h2>
            <p className="text-muted-foreground">{job.companies?.name}</p>
          </div>
          <ApplicationForm jobId={id} applicantId={applicant.id} />
        </div>
      </main>
    </div>
  )
}
