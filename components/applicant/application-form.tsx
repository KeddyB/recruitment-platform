"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ApplicationFormProps {
  jobId: string
  applicantId: string
}

export function ApplicationForm({ jobId, applicantId }: ApplicationFormProps) {
  const [coverLetter, setCoverLetter] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from("applications").insert({
        job_id: jobId,
        applicant_id: applicantId,
        cover_letter: coverLetter || null,
        status: "pending",
      })

      if (insertError) throw insertError

      router.push("/applicant/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Application</CardTitle>
        <CardDescription>Tell the employer why you&apos;re a great fit for this role</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <Textarea
                id="coverLetter"
                placeholder="Explain why you're interested in this position and what makes you a great candidate..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
