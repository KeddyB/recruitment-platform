import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { calculateMatchScore } from "@/lib/ai/ranking"

/**
 * API endpoint to rank candidates for a specific job
 * Returns candidates sorted by match score
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { job_id } = await request.json()

    if (!job_id) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 })
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*, companies(*)")
      .eq("id", job_id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Verify ownership
    if (job.companies?.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all applications for this job with parsed resumes
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select("*, applicants(*, parsed_resumes(*))")
      .eq("job_id", job_id)

    if (appsError) {
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({ candidates: [] })
    }

    // Calculate match scores for each candidate
    const rankedCandidates = applications
      .filter((app) => app.applicants?.parsed_resumes?.[0]) // Only include candidates with parsed resumes
      .map((app) => {
        const resume = app.applicants.parsed_resumes[0]
        const score = calculateMatchScore(
          {
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            experience_required: 3, // Could be extracted from job requirements
          },
          {
            skills: resume.skills || [],
            experience_years: resume.experience_years || 0,
            education: resume.education || [],
            job_titles: resume.job_titles || [],
            embedding: resume.embedding || [],
          },
        )

        return {
          application_id: app.id,
          applicant_id: app.applicant_id,
          applicant_name: app.applicants.full_name,
          applicant_email: app.applicants.email,
          score,
        }
      })
      .sort((a, b) => b.score.total_score - a.score.total_score)

    return NextResponse.json({ candidates: rankedCandidates })
  } catch (error) {
    console.error("Ranking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
