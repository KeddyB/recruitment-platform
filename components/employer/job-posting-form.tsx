"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface JobPostingFormProps {
  companyId: string
  userId: string
}

export function JobPostingForm({ companyId, userId }: JobPostingFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState<string>("")
  const [salaryRange, setSalaryRange] = useState("")
  const [requirements, setRequirements] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from("jobs").insert({
        company_id: companyId,
        title,
        description,
        location,
        job_type: jobType,
        salary_range: salaryRange || null,
        requirements,
        posted_by: userId,
        status: "active",
      })

      if (insertError) throw insertError

      router.push("/employer/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
        <CardDescription>Provide detailed information about the position</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Senior Full Stack Developer"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                type="text"
                placeholder="San Francisco, CA or Remote"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="jobType">Job Type *</Label>
              <Select value={jobType} onValueChange={setJobType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="salaryRange">Salary Range</Label>
              <Input
                id="salaryRange"
                type="text"
                placeholder="$100,000 - $150,000"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requirements">Requirements *</Label>
              <Textarea
                id="requirements"
                placeholder="List the required skills, experience, and qualifications..."
                required
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={4}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
