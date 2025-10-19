"use client"

import type React from "react"

import { useState } from "react"
// @ts-ignore - no declaration file for 'next/navigation' in this environment
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ApplicantSetupFormProps {
  userId: string
  userEmail: string
}

export function ApplicantSetupForm({ userId, userEmail }: ApplicantSetupFormProps) {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (!fullName.trim()) {
        throw new Error("Full name is required")
      }

      let resumeUrl: string | null = null

      if (resumeFile) {
        try {
          const fileExt = resumeFile.name.split(".").pop()
          const fileName = `${userId}/resume-${Date.now()}.${fileExt}`

          const { error: uploadError, data } = await supabase.storage.from("resumes").upload(fileName, resumeFile, {
            upsert: true,
          })

          if (uploadError) {
            throw new Error(`Resume upload failed: ${uploadError.message}`)
          }

          // Get public URL
          const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(fileName)
          resumeUrl = urlData.publicUrl
        } catch (uploadErr) {
          const uploadErrorMsg = uploadErr instanceof Error ? uploadErr.message : "Resume upload failed"
          console.warn("[v0] Resume upload warning:", uploadErrorMsg)
          // Continue without resume - it's optional
        }
      }

      const { error: upsertError } = await supabase.from("applicants").upsert(
        {
          user_id: userId,
          full_name: fullName.trim(),
          email: userEmail,
          phone: phone.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          resume_url: resumeUrl,
        },
        {
          onConflict: "user_id",
        },
      )

      if (upsertError) {
        throw new Error(`Failed to save profile: ${upsertError.message}`)
      }

      router.push("/applicant/dashboard")
      router.refresh()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : typeof error === "string" ? error : "An unexpected error occurred"
      console.error("[v0] Form submission error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>This information will be shared with employers when you apply</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={userEmail} disabled />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/johndoe"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="resume">Resume (PDF or Word) - Optional</Label>
              <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
              {resumeFile && <p className="text-sm text-muted-foreground">Selected: {resumeFile.name}</p>}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !fullName.trim()}>
              {isLoading ? "Creating..." : "Complete Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
