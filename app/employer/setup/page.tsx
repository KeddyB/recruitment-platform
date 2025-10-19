import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompanySetupForm } from "@/components/employer/company-setup-form"

export default async function EmployerSetup() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "employer") {
    redirect("/auth/login")
  }

  // Check if company already exists
  const { data: existingCompany } = await supabase.from("companies").select("id").eq("owner_id", user.id).single()

  if (existingCompany) {
    redirect("/employer/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Set Up Your Company Profile</h1>
          <p className="mt-2 text-muted-foreground">Tell us about your company to start posting jobs</p>
        </div>
        <CompanySetupForm userId={user.id} />
      </div>
    </div>
  )
}
