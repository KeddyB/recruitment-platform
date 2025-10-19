"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ResumeUploadFormProps {
  applicantId: string
  userId: string
}

export function ResumeUploadForm({ applicantId, userId }: ResumeUploadFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or Word document")
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      setResumeFile(file)
      setError(null)
      setSuccess(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resumeFile) {
      setError("Please select a file")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const fileExt = resumeFile.name.split(".").pop()
      const fileName = `${userId}/resume-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("resumes").upload(fileName, resumeFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(fileName)

      // Update applicant record
      const { error: updateError } = await supabase
        .from("applicants")
        .update({ resume_url: urlData.publicUrl })
        .eq("id", applicantId)

      if (updateError) throw updateError

      setSuccess("Resume uploaded successfully!")
      setResumeFile(null)

      // Reset file input
      const fileInput = document.getElementById("resume-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      // Refresh the page to show updated resume
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="resume-upload">Upload Resume (PDF or Word)</Label>
          <Input id="resume-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          {resumeFile && <p className="text-sm text-muted-foreground">Selected: {resumeFile.name}</p>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <Button type="submit" disabled={isLoading || !resumeFile}>
          {isLoading ? "Uploading..." : "Upload Resume"}
        </Button>
      </div>
    </form>
  )
}
