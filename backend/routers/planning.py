"""
Construction Project Planning Router
AI-powered project planning, scheduling, and resource estimation
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.gemini_service import analyze_text

router = APIRouter()


class ProjectPlanRequest(BaseModel):
    project_name: str
    project_type: str  # residential, commercial, industrial, infrastructure
    description: str
    location: str
    total_area_sqft: Optional[float] = None
    budget_inr: Optional[float] = None
    target_duration_months: Optional[int] = None
    floors: Optional[int] = None
    special_requirements: Optional[str] = ""
    client_type: Optional[str] = "Private"


@router.post("/generate-plan")
async def generate_project_plan(request: ProjectPlanRequest):
    """Generate a comprehensive construction project plan."""
    prompt = f"""
You are a senior construction project manager and civil engineer with 25+ years of experience
in Indian construction projects. Generate a detailed project plan.

Project Details:
- Name: {request.project_name}
- Type: {request.project_type}
- Description: {request.description}
- Location: {request.location}
- Area: {request.total_area_sqft or 'Not specified'} sq ft
- Budget: ₹{request.budget_inr:,.0f if request.budget_inr else 'Not specified'}
- Target Duration: {request.target_duration_months or 'Not specified'} months
- Floors: {request.floors or 'Not specified'}
- Special Requirements: {request.special_requirements or 'None'}
- Client Type: {request.client_type}

Return a comprehensive JSON project plan:
{{
  "project_overview": {{
    "name": "{request.project_name}",
    "type": "{request.project_type}",
    "estimated_duration_months": <number>,
    "estimated_total_cost_inr": <number>,
    "complexity_level": "LOW|MEDIUM|HIGH|VERY_HIGH",
    "recommended_team_size": <number>
  }},
  "phases": [
    {{
      "phase_number": 1,
      "phase_name": "<name>",
      "description": "<description>",
      "duration_weeks": <number>,
      "start_week": 1,
      "end_week": <number>,
      "key_activities": ["<activity>"],
      "deliverables": ["<deliverable>"],
      "budget_allocation_percentage": <number>,
      "critical_path": true|false
    }}
  ],
  "resource_plan": {{
    "workforce": [
      {{"role": "<role>", "count": <number>, "duration_months": <number>, "daily_rate_inr": <number>}}
    ],
    "equipment": [
      {{"equipment": "<name>", "quantity": <number>, "rental_period_months": <number>, "monthly_cost_inr": <number>}}
    ],
    "materials_estimate": [
      {{"material": "<name>", "quantity": "<qty with unit>", "estimated_cost_inr": <number>}}
    ]
  }},
  "budget_breakdown": {{
    "civil_works_percentage": <number>,
    "materials_percentage": <number>,
    "labor_percentage": <number>,
    "equipment_percentage": <number>,
    "contingency_percentage": <number>,
    "overhead_percentage": <number>,
    "phase_wise_budget": [{{"phase": "<name>", "amount_inr": <number>}}]
  }},
  "risk_register": [
    {{
      "risk": "<risk description>",
      "probability": "LOW|MEDIUM|HIGH",
      "impact": "LOW|MEDIUM|HIGH",
      "mitigation": "<mitigation strategy>",
      "contingency": "<contingency plan>"
    }}
  ],
  "quality_milestones": [
    {{"milestone": "<name>", "week": <number>, "inspection_type": "<type>", "success_criteria": "<criteria>"}}
  ],
  "compliance_checklist": ["<permit/approval needed>"],
  "sustainability_recommendations": ["<green construction tip>"],
  "success_factors": ["<key success factor>"]
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


class CostEstimateRequest(BaseModel):
    project_type: str
    area_sqft: float
    location: str
    quality_grade: str  # basic, standard, premium, luxury
    special_features: Optional[list[str]] = []


@router.post("/cost-estimate")
async def quick_cost_estimate(request: CostEstimateRequest):
    """Generate a quick cost estimate for a construction project."""
    features_str = ", ".join(request.special_features) if request.special_features else "None"
    prompt = f"""
You are a construction cost estimator in India. Provide a detailed cost breakdown.

Project: {request.project_type}, {request.area_sqft} sq ft, {request.location}
Quality Grade: {request.quality_grade}
Special Features: {features_str}

Return JSON:
{{
  "total_estimated_cost_inr": <number>,
  "cost_per_sqft_inr": <number>,
  "breakdown": [
    {{"category": "<category>", "cost_inr": <number>, "percentage": <number>, "notes": "<details>"}}
  ],
  "quality_grade_details": {{
    "grade": "{request.quality_grade}",
    "typical_finishes": ["<finish>"],
    "structural_specifications": "<specs>"
  }},
  "cost_optimization_tips": ["<tip>"],
  "regional_adjustments": "<notes about {request.location} specific costs>",
  "validity_note": "Estimates valid for 3 months from date of generation"
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
