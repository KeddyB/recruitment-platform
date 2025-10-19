"""
Resume parsing script using NLP to extract skills, experience, and other information.
This script processes uploaded resumes and stores structured data in the database.
"""

import re
import json
from typing import List, Dict, Any

# Mock implementation for MVP - in production, use libraries like:
# - PyPDF2 or pdfplumber for PDF parsing
# - python-docx for Word documents
# - spaCy or NLTK for NLP
# - sentence-transformers for embeddings

def extract_text_from_resume(file_path: str) -> str:
    """
    Extract text from resume file (PDF or Word).
    In production, use PyPDF2, pdfplumber, or python-docx.
    """
    # Mock implementation - returns sample text
    return """
    John Doe
    Software Engineer
    john.doe@example.com | (555) 123-4567
    
    EXPERIENCE
    Senior Full Stack Developer at TechCorp (2020-2023)
    - Built scalable web applications using React, Node.js, and PostgreSQL
    - Led team of 5 developers on major product features
    - Implemented CI/CD pipelines and improved deployment efficiency by 40%
    
    Full Stack Developer at StartupHub (2018-2020)
    - Developed RESTful APIs and microservices
    - Worked with Python, Django, and AWS
    
    SKILLS
    JavaScript, TypeScript, React, Node.js, Python, Django, PostgreSQL, MongoDB, 
    AWS, Docker, Kubernetes, Git, CI/CD, Agile, REST APIs
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of California, Berkeley (2014-2018)
    """

def extract_skills(text: str) -> List[str]:
    """
    Extract technical skills from resume text.
    In production, use NLP models or skill extraction APIs.
    """
    # Common technical skills to look for
    skill_keywords = [
        'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
        'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
        'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
        'git', 'ci/cd', 'jenkins', 'github actions',
        'rest', 'graphql', 'microservices', 'agile', 'scrum'
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in skill_keywords:
        if skill in text_lower:
            found_skills.append(skill.title())
    
    return list(set(found_skills))

def extract_experience_years(text: str) -> int:
    """
    Estimate years of experience from resume text.
    In production, use date parsing and calculation.
    """
    # Look for year patterns like "2020-2023" or "2020 - Present"
    year_patterns = re.findall(r'(\d{4})\s*[-–]\s*(\d{4}|Present|Current)', text)
    
    total_years = 0
    current_year = 2024
    
    for start, end in year_patterns:
        start_year = int(start)
        end_year = current_year if end in ['Present', 'Current'] else int(end)
        total_years += max(0, end_year - start_year)
    
    return min(total_years, 30)  # Cap at 30 years

def extract_education(text: str) -> List[str]:
    """
    Extract education information from resume.
    In production, use NER (Named Entity Recognition) models.
    """
    education_keywords = [
        'bachelor', 'master', 'phd', 'doctorate', 'associate',
        'b.s.', 'm.s.', 'b.a.', 'm.a.', 'mba', 'computer science',
        'engineering', 'university', 'college', 'institute'
    ]
    
    education = []
    lines = text.split('\n')
    
    for line in lines:
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in education_keywords):
            education.append(line.strip())
    
    return education[:5]  # Return top 5 education entries

def extract_job_titles(text: str) -> List[str]:
    """
    Extract job titles from resume.
    In production, use NER models trained on job titles.
    """
    title_keywords = [
        'developer', 'engineer', 'architect', 'manager', 'director',
        'analyst', 'designer', 'consultant', 'specialist', 'lead',
        'senior', 'junior', 'staff', 'principal'
    ]
    
    titles = []
    lines = text.split('\n')
    
    for line in lines:
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in title_keywords):
            # Clean up the line
            title = line.strip()
            if len(title) < 100 and title:  # Reasonable title length
                titles.append(title)
    
    return list(set(titles))[:10]  # Return unique titles, max 10

def compute_embedding(text: str) -> List[float]:
    """
    Compute sentence embedding for the resume text.
    In production, use sentence-transformers library with all-MiniLM-L6-v2 model.
    
    Example:
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embedding = model.encode(text)
    """
    # Mock embedding - returns 384-dimensional vector (same as all-MiniLM-L6-v2)
    # In production, this would be actual embeddings
    import hashlib
    
    # Generate deterministic "embedding" from text hash for demo
    text_hash = hashlib.md5(text.encode()).hexdigest()
    seed = int(text_hash[:8], 16)
    
    # Generate 384 random-ish values between -1 and 1
    embedding = []
    for i in range(384):
        val = ((seed + i * 12345) % 10000) / 5000 - 1
        embedding.append(val)
    
    return embedding

def parse_resume(file_path: str) -> Dict[str, Any]:
    """
    Main function to parse resume and extract all information.
    """
    # Extract text
    text = extract_text_from_resume(file_path)
    
    # Extract structured information
    skills = extract_skills(text)
    experience_years = extract_experience_years(text)
    education = extract_education(text)
    job_titles = extract_job_titles(text)
    embedding = compute_embedding(text)
    
    return {
        'raw_text': text,
        'skills': skills,
        'experience_years': experience_years,
        'education': education,
        'job_titles': job_titles,
        'embedding': embedding
    }

# Example usage
if __name__ == '__main__':
    result = parse_resume('sample_resume.pdf')
    print(json.dumps({
        'skills': result['skills'],
        'experience_years': result['experience_years'],
        'education': result['education'][:2],
        'job_titles': result['job_titles'][:3]
    }, indent=2))
