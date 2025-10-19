import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ApplicantSetupForm } from "@/components/applicant/applicant-setup-form"

export default async function ApplicantSetup() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "applicant") {
    redirect("/auth/login")
  }

  const { data: existingApplicant, error } = await supabase
    .from("applicants")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows found" which is expected
    console.error("[v0] Error checking applicant profile:", error)
  }

  if (existingApplicant) {
    redirect("/applicant/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="mt-2 text-muted-foreground">Tell us about yourself to start applying for jobs</p>
        </div>
        <ApplicantSetupForm userId={user.id} userEmail={user.email!} />
      </div>
    </div>
  )
}
