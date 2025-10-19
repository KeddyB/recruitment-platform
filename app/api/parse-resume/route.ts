import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * API endpoint to trigger resume parsing for an applicant
 * This would typically be called after a resume is uploaded
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { applicant_id } = await request.json()

    if (!applicant_id) {
      return NextResponse.json({ error: "Applicant ID required" }, { status: 400 })
    }

    // Get applicant data
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("*")
      .eq("id", applicant_id)
      .single()

    if (applicantError || !applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 })
    }

    // Verify ownership (user can only parse their own resume)
    if (applicant.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!applicant.resume_url) {
      return NextResponse.json({ error: "No resume uploaded" }, { status: 400 })
    }

    // In production, this would:
    // 1. Download the resume file from storage
    // 2. Call the Python parsing service
    // 3. Store the results in parsed_resumes table

    // For MVP, we'll create mock parsed data
    const mockParsedData = {
      applicant_id,
      raw_text: "Sample resume text...",
      skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "Python"],
      experience_years: 5,
      education: ["Bachelor of Science in Computer Science"],
      job_titles: ["Senior Full Stack Developer", "Full Stack Developer"],
      // Mock embedding (384 dimensions for all-MiniLM-L6-v2)
      embedding: Array(384)
        .fill(0)
        .map(() => Math.random() * 2 - 1),
    }

    // Store parsed resume data
    const { error: insertError } = await supabase
      .from("parsed_resumes")
      .upsert(mockParsedData, { onConflict: "applicant_id" })

    if (insertError) {
      console.error("Error storing parsed resume:", insertError)
      return NextResponse.json({ error: "Failed to store parsed data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Resume parsed successfully",
      data: {
        skills: mockParsedData.skills,
        experience_years: mockParsedData.experience_years,
      },
    })
  } catch (error) {
    console.error("Resume parsing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
