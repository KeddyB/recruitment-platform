"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface RankCandidatesButtonProps {
  jobId: string
}

interface RankedCandidate {
  application_id: string
  applicant_id: string
  applicant_name: string
  applicant_email: string
  score: {
    total_score: number
    skill_match: number
    experience_match: number
    title_match: number
    education_match: number
  }
}

export function RankCandidatesButton({ jobId }: RankCandidatesButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleRank = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/rank-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
      })

      if (!response.ok) {
        throw new Error("Failed to rank candidates")
      }

      const data = await response.json()
      setRankedCandidates(data.candidates)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={handleRank}>
          Rank
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI-Ranked Candidates</DialogTitle>
          <DialogDescription>
            Candidates ranked by match score based on skills, experience, and qualifications
          </DialogDescription>
        </DialogHeader>

        {isLoading && <p className="text-center text-muted-foreground">Analyzing candidates...</p>}

        {error && <p className="text-center text-red-500">{error}</p>}

        {!isLoading && !error && rankedCandidates.length === 0 && (
          <p className="text-center text-muted-foreground">No candidates with parsed resumes found</p>
        )}

        {!isLoading && rankedCandidates.length > 0 && (
          <div className="space-y-4">
            {rankedCandidates.map((candidate, index) => (
              <div key={candidate.application_id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <h4 className="font-semibold">{candidate.applicant_name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{candidate.applicant_email}</p>
                  </div>
                  <Badge variant="default" className="text-lg font-bold">
                    {candidate.score.total_score}%
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Skills:</span>{" "}
                    <span className="font-medium">{candidate.score.skill_match}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Experience:</span>{" "}
                    <span className="font-medium">{candidate.score.experience_match}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Title:</span>{" "}
                    <span className="font-medium">{candidate.score.title_match}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Education:</span>{" "}
                    <span className="font-medium">{candidate.score.education_match}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
