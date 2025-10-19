/**
 * AI-powered candidate ranking system
 * Calculates match scores between job requirements and candidate profiles
 */

interface ParsedResume {
  skills: string[]
  experience_years: number
  education: string[]
  job_titles: string[]
  embedding: number[]
}

interface Job {
  title: string
  description: string
  requirements: string
  experience_required?: number
}

interface MatchScore {
  total_score: number
  skill_match: number
  experience_match: number
  title_match: number
  education_match: number
}

/**
 * Calculate skill match score between job requirements and candidate skills
 */
export function calculateSkillMatch(jobRequirements: string, candidateSkills: string[]): number {
  if (!candidateSkills || candidateSkills.length === 0) return 0

  const reqLower = jobRequirements.toLowerCase()
  const matchedSkills = candidateSkills.filter((skill) => reqLower.includes(skill.toLowerCase()))

  // Score based on percentage of candidate skills that match
  return (matchedSkills.length / candidateSkills.length) * 100
}

/**
 * Calculate experience match score
 */
export function calculateExperienceMatch(requiredYears: number, candidateYears: number): number {
  if (candidateYears >= requiredYears) {
    return 100
  }

  // Partial credit for having some experience
  return (candidateYears / requiredYears) * 100
}

/**
 * Calculate job title match score
 */
export function calculateTitleMatch(jobTitle: string, candidateTitles: string[]): number {
  if (!candidateTitles || candidateTitles.length === 0) return 0

  const jobTitleLower = jobTitle.toLowerCase()
  const titleWords = jobTitleLower.split(" ")

  let maxMatch = 0

  for (const candidateTitle of candidateTitles) {
    const candidateLower = candidateTitle.toLowerCase()
    let matchCount = 0

    for (const word of titleWords) {
      if (candidateLower.includes(word)) {
        matchCount++
      }
    }

    const matchScore = (matchCount / titleWords.length) * 100
    maxMatch = Math.max(maxMatch, matchScore)
  }

  return maxMatch
}

/**
 * Calculate education match score
 */
export function calculateEducationMatch(jobRequirements: string, candidateEducation: string[]): number {
  if (!candidateEducation || candidateEducation.length === 0) return 50 // Neutral score

  const reqLower = jobRequirements.toLowerCase()
  const educationLevels = ["phd", "doctorate", "master", "bachelor", "associate"]

  // Check if requirements mention education
  const requiresEducation = educationLevels.some((level) => reqLower.includes(level))

  if (!requiresEducation) return 50 // Neutral if not specified

  // Check if candidate has relevant education
  const candidateStr = candidateEducation.join(" ").toLowerCase()
  const hasRelevantEducation = educationLevels.some((level) => candidateStr.includes(level))

  return hasRelevantEducation ? 100 : 30
}

/**
 * Calculate cosine similarity between two vectors (for embeddings)
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0

  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2)
  return denominator === 0 ? 0 : dotProduct / denominator
}

/**
 * Calculate overall match score between job and candidate
 */
export function calculateMatchScore(job: Job, resume: ParsedResume): MatchScore {
  // Calculate individual component scores
  const skillMatch = calculateSkillMatch(job.requirements, resume.skills)
  const experienceMatch = calculateExperienceMatch(job.experience_required || 0, resume.experience_years)
  const titleMatch = calculateTitleMatch(job.title, resume.job_titles)
  const educationMatch = calculateEducationMatch(job.requirements, resume.education)

  // Weighted average (can be adjusted based on importance)
  const weights = {
    skills: 0.4,
    experience: 0.25,
    title: 0.2,
    education: 0.15,
  }

  const totalScore =
    skillMatch * weights.skills +
    experienceMatch * weights.experience +
    titleMatch * weights.title +
    educationMatch * weights.education

  return {
    total_score: Math.round(totalScore),
    skill_match: Math.round(skillMatch),
    experience_match: Math.round(experienceMatch),
    title_match: Math.round(titleMatch),
    education_match: Math.round(educationMatch),
  }
}

/**
 * Rank candidates for a job based on match scores
 */
export function rankCandidates(
  job: Job,
  candidates: Array<{ id: string; resume: ParsedResume }>,
): Array<{ id: string; score: MatchScore }> {
  const rankedCandidates = candidates.map((candidate) => ({
    id: candidate.id,
    score: calculateMatchScore(job, candidate.resume),
  }))

  // Sort by total score descending
  rankedCandidates.sort((a, b) => b.score.total_score - a.score.total_score)

  return rankedCandidates
}
