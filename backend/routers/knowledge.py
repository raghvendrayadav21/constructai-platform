"""
Construction Knowledge Assistant Router
AI-powered Q&A for construction knowledge, IS codes, and best practices
"""

import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
from services.gemini_service import analyze_text, analyze_image_and_text

router = APIRouter()


class KnowledgeQuery(BaseModel):
    question: str
    domain: Optional[str] = "general"  # civil, structural, electrical, plumbing, safety, materials
    experience_level: Optional[str] = "professional"  # beginner, intermediate, professional
    context: Optional[str] = ""


class QuizRequest(BaseModel):
    topic: str
    difficulty: str = "intermediate"  # beginner, intermediate, advanced
    num_questions: int = 5


@router.post("/ask")
async def ask_knowledge(request: KnowledgeQuery):
    """Answer construction knowledge questions."""
    level_guidance = {
        "beginner": "Explain in simple terms, avoid heavy jargon, use analogies.",
        "intermediate": "Use technical terms with brief explanations where needed.",
        "professional": "Use full technical language, cite IS codes and standards."
    }
    level_note = level_guidance.get(request.experience_level, level_guidance["professional"])

    prompt = f"""
You are ConstructAI, an expert in all aspects of construction, civil engineering, 
architecture, and building sciences with deep knowledge of Indian Standards (IS codes),
NBC (National Building Code), CPWD specifications, and international best practices.

Domain: {request.domain}
Experience Level: {request.experience_level} — {level_note}
Additional Context: {request.context if request.context else 'None'}

Question: {request.question}

Provide a comprehensive answer as a JSON object:
{{
  "answer": "<detailed, well-structured answer with proper technical content>",
  "key_points": ["<key point 1>", "<key point 2>"],
  "relevant_is_codes": ["<IS code: description>"],
  "practical_tips": ["<actionable tip>"],
  "common_mistakes": ["<mistake to avoid>"],
  "related_topics": ["<related topic>"],
  "references": ["<book/standard/resource>"],
  "difficulty_level": "BASIC|INTERMEDIATE|ADVANCED",
  "domain": "{request.domain}"
}}
Only return JSON.
"""
    try:
        raw_response = await analyze_text(prompt)
        text = raw_response.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        result = json.loads(text)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-drawing")
async def analyze_drawing(
    file: UploadFile = File(...),
    query: str = Form("Analyze this construction drawing and explain what it shows.")
):
    """Analyze a construction drawing or technical image."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    prompt = f"""
You are a construction expert analyzing a technical drawing or construction-related image.

User Query: {query}

Analyze the image and provide:
{{
  "image_type": "<type of drawing/image>",
  "summary": "<what this shows>",
  "key_elements": ["<element identified>"],
  "technical_specifications_visible": ["<spec>"],
  "annotations_and_symbols": ["<symbol: meaning>"],
  "compliance_observations": ["<IS code compliance note>"],
  "concerns_or_errors": ["<any issues spotted>"],
  "recommendations": ["<recommendation>"],
  "query_response": "<specific answer to user query>"
}}
Only return JSON.
"""
    try:
        image_bytes = await file.read()
        raw_response = await analyze_image_and_text(image_bytes, prompt)
        text = raw_response.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        result = json.loads(text)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quiz")
async def generate_quiz(request: QuizRequest):
    """Generate a construction knowledge quiz."""
    prompt = f"""
Generate a {request.num_questions}-question multiple choice quiz on the topic: "{request.topic}"
Difficulty: {request.difficulty}
Focus on practical, real-world construction scenarios.

Return as JSON:
{{
  "quiz_title": "<title>",
  "topic": "{request.topic}",
  "difficulty": "{request.difficulty}",
  "questions": [
    {{
      "id": 1,
      "question": "<question text>",
      "options": {{"A": "<option>", "B": "<option>", "C": "<option>", "D": "<option>"}},
      "correct_answer": "A|B|C|D",
      "explanation": "<why this is correct>",
      "is_code_reference": "<relevant IS code if applicable>"
    }}
  ]
}}
Only return JSON.
"""
    try:
        raw_response = await analyze_text(prompt)
        text = raw_response.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        result = json.loads(text)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
