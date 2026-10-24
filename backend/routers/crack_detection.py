"""
Crack Detection & Analysis Router
Analyzes images for structural cracks using Gemini Vision
"""

import json
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.gemini_service import analyze_image_and_text

router = APIRouter()

CRACK_DETECTION_PROMPT = """
You are a structural engineering expert specializing in crack detection and analysis.
Analyze this image for any structural cracks, damage, or deterioration.

Return your response as a valid JSON object with this exact structure:
{
  "crack_detected": true|false,
  "structural_integrity": "GOOD|FAIR|POOR|CRITICAL",
  "integrity_score": <integer 0-100>,
  "summary": "<overall assessment in 2-3 sentences>",
  "cracks": [
    {
      "id": 1,
      "type": "Hairline|Structural|Settlement|Shrinkage|Diagonal|Horizontal|Vertical",
      "severity": "MINOR|MODERATE|SEVERE|CRITICAL",
      "location": "<where in the image/structure>",
      "estimated_width": "<e.g. <0.1mm, 0.1-1mm, >1mm>",
      "estimated_length": "<approximate>",
      "pattern": "<description of crack pattern>",
      "likely_cause": "<probable cause>",
      "urgency": "MONITOR|REPAIR_SOON|REPAIR_IMMEDIATELY|EVACUATE"
    }
  ],
  "affected_materials": ["<material1>", "<material2>"],
  "repair_recommendations": [
    {
      "crack_id": 1,
      "method": "<repair method>",
      "materials_needed": ["<material>"],
      "estimated_cost_range": "<range in INR>",
      "timeline": "<repair timeline>"
    }
  ],
  "monitoring_advice": "<advice for ongoing monitoring>",
  "professional_inspection_required": true|false,
  "safety_concern": "<any immediate safety concerns>"
}

Only return the JSON object, no extra text.
"""


@router.post("/analyze")
async def detect_cracks(file: UploadFile = File(...)):
    """Analyze an image for structural cracks."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        image_bytes = await file.read()
        raw_response = await analyze_image_and_text(image_bytes, CRACK_DETECTION_PROMPT)

        text = raw_response.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        result = json.loads(text)
        return {"success": True, "data": result}

    except json.JSONDecodeError:
        return {"success": True, "data": {"raw_response": raw_response, "crack_detected": None}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
