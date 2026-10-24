"""
Real Estate Valuation Router
AI-powered property valuation based on structured inputs
"""

import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from services.gemini_service import analyze_text, analyze_image_and_text

router = APIRouter()


class ValuationRequest(BaseModel):
    property_type: str  # residential, commercial, industrial, land
    location: str
    city: str
    state: str
    area_sqft: float
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    age_years: int
    floors: Optional[int] = None
    amenities: Optional[list[str]] = []
    condition: str  # excellent, good, fair, poor
    nearby_facilities: Optional[list[str]] = []
    additional_notes: Optional[str] = ""


@router.post("/estimate")
async def estimate_valuation(request: ValuationRequest):
    """Estimate property valuation based on structured data."""
    amenities_str = ", ".join(request.amenities) if request.amenities else "None specified"
    nearby_str = ", ".join(request.nearby_facilities) if request.nearby_facilities else "None specified"

    prompt = f"""
You are a certified real estate valuation expert in India with expertise in current market trends.

Property Details:
- Type: {request.property_type}
- Location: {request.location}, {request.city}, {request.state}
- Area: {request.area_sqft} sq ft
- Bedrooms: {request.bedrooms or 'N/A'}
- Bathrooms: {request.bathrooms or 'N/A'}
- Age: {request.age_years} years
- Floors: {request.floors or 'N/A'}
- Condition: {request.condition}
- Amenities: {amenities_str}
- Nearby Facilities: {nearby_str}
- Additional Notes: {request.additional_notes}

Provide a comprehensive property valuation report as a JSON object:
{{
  "estimated_value": {{
    "minimum": <number in INR>,
    "maximum": <number in INR>,
    "most_likely": <number in INR>,
    "per_sqft_rate": <number in INR>
  }},
  "rental_potential": {{
    "monthly_rent_range": {{"min": <number>, "max": <number>}},
    "annual_yield_percentage": <float>
  }},
  "valuation_factors": [
    {{"factor": "<name>", "impact": "POSITIVE|NEGATIVE|NEUTRAL", "weight": "<High|Medium|Low>", "description": "<explanation>"}}
  ],
  "market_analysis": {{
    "current_market_trend": "RISING|STABLE|DECLINING",
    "demand_level": "HIGH|MEDIUM|LOW",
    "supply_level": "HIGH|MEDIUM|LOW",
    "investment_rating": "<1-5 stars>",
    "market_commentary": "<2-3 sentences>"
  }},
  "comparable_properties": [
    {{"description": "<similar property>", "estimated_value": <number>, "key_difference": "<what differs>"}}
  ],
  "investment_outlook": {{
    "short_term_1yr": "<outlook>",
    "medium_term_3yr": "<outlook>",
    "long_term_5yr": "<outlook>",
    "appreciation_rate_estimate": "<annual %>",
    "recommendation": "BUY|HOLD|SELL|RENT_OUT"
  }},
  "risks": ["<risk1>", "<risk2>"],
  "opportunities": ["<opportunity1>", "<opportunity2>"],
  "disclaimer": "This is an AI-generated estimate for informational purposes only."
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


@router.post("/analyze-property-image")
async def analyze_property_image(file: UploadFile = File(...), context: str = Form("")):
    """Analyze a property image for condition assessment."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    prompt = f"""
You are a real estate expert analyzing a property image for valuation purposes.
Context: {context if context else 'General property assessment'}

Analyze the image and return a JSON object:
{{
  "property_condition": "EXCELLENT|GOOD|FAIR|POOR",
  "condition_score": <integer 0-100>,
  "observed_features": ["<feature1>", "<feature2>"],
  "value_adding_elements": ["<element1>"],
  "value_reducing_elements": ["<element1>"],
  "estimated_renovation_needed": true|false,
  "renovation_areas": ["<area1>"],
  "renovation_cost_estimate": "<range in INR>",
  "property_type_guess": "<type>",
  "construction_quality": "PREMIUM|STANDARD|BASIC",
  "notes": "<additional observations>"
}}
Only return the JSON.
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
