"""
Safety Monitoring Router
Analyzes construction site images for safety hazards using Gemini Vision
"""

import json
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from services.gemini_service import analyze_image_and_text, analyze_text

router = APIRouter()

SAFETY_PROMPT = """
You are an expert construction site safety inspector with 20+ years of experience.
Analyze this construction site image and provide a detailed safety assessment.

Return your response as a valid JSON object with this exact structure:
{
  "overall_risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "risk_score": <integer 0-100>,
  "summary": "<2-3 sentence summary>",
  "hazards": [
    {
      "category": "<category name>",
      "description": "<detailed description>",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "location": "<where in image>",
      "recommendation": "<specific corrective action>"
    }
  ],
  "ppe_compliance": {
    "status": "COMPLIANT|PARTIAL|NON_COMPLIANT",
    "observations": ["<observation1>", "<observation2>"]
  },
  "positive_observations": ["<good practice 1>", "<good practice 2>"],
  "immediate_actions": ["<action1>", "<action2>"],
  "regulatory_references": ["<OSHA/IS code reference>"]
}

Be thorough and precise. Only return the JSON object, no extra text.
"""


class TextSafetyRequest(BaseModel):
    site_description: str
    location: str = ""
    work_type: str = ""


@router.post("/analyze-image")
async def analyze_site_image(file: UploadFile = File(...)):
    """Analyze a construction site image for safety hazards."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        image_bytes = await file.read()
        raw_response = await analyze_image_and_text(image_bytes, SAFETY_PROMPT)

        # Extract JSON from response
        text = raw_response.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        result = json.loads(text)
        return {"success": True, "data": result}

    except json.JSONDecodeError:
        return {"success": True, "data": {"raw_response": raw_response}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-text")
async def analyze_site_text(request: TextSafetyRequest):
    """Analyze site safety based on text description."""
    prompt = f"""
You are an expert construction site safety inspector.
Based on the following site description, provide a safety assessment.

Site Description: {request.site_description}
Location: {request.location}
Work Type: {request.work_type}

Return a JSON object with the same structure as a visual safety inspection report:
{{
  "overall_risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "risk_score": <integer 0-100>,
  "summary": "<summary>",
  "hazards": [{{"category": "", "description": "", "severity": "", "location": "Based on description", "recommendation": ""}}],
  "ppe_compliance": {{"status": "COMPLIANT|PARTIAL|NON_COMPLIANT", "observations": []}},
  "positive_observations": [],
  "immediate_actions": [],
  "regulatory_references": []
}}

Only return the JSON object.
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
