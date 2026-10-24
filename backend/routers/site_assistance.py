"""
Daily Site Assistance Router
AI-powered chat assistant for construction site professionals
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from services.gemini_service import analyze_text

router = APIRouter()

SYSTEM_CONTEXT = """
You are ConstructAI, an expert AI assistant for construction site professionals.
You have deep expertise in:
- Civil and structural engineering
- Construction methods and best practices
- Indian construction standards (IS codes)
- Safety regulations (Indian and international)
- Material selection and specifications
- Site management and supervision
- Construction defect identification
- Building bylaws and approvals

Be concise, practical, and actionable. Use simple language appropriate for site supervisors.
Always prioritize safety in your responses.
"""


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class AssistanceRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    context: Optional[str] = ""  # site type, location, etc.


class DailySummaryRequest(BaseModel):
    site_name: str
    date: str
    work_completed: List[str]
    workers_present: int
    materials_used: List[str]
    issues_encountered: Optional[List[str]] = []
    weather_conditions: Optional[str] = ""
    next_day_plan: Optional[str] = ""


@router.post("/chat")
async def site_chat(request: AssistanceRequest):
    """Chat with the AI construction assistant."""
    # Build conversation context
    history_text = ""
    for msg in request.conversation_history[-8:]:  # Last 8 messages for context
        prefix = "User" if msg.role == "user" else "ConstructAI"
        history_text += f"{prefix}: {msg.content}\n"

    context_note = f"\nSite Context: {request.context}" if request.context else ""

    prompt = f"""
{SYSTEM_CONTEXT}{context_note}

Previous conversation:
{history_text}

User: {request.message}

Provide a helpful, expert response. Format with clear points where appropriate.
"""
    try:
        response = await analyze_text(prompt)
        return {
            "success": True,
            "data": {
                "message": response,
                "role": "assistant"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/daily-report")
async def generate_daily_report(request: DailySummaryRequest):
    """Generate a professional daily site report."""
    work_str = "\n".join(f"- {w}" for w in request.work_completed)
    materials_str = "\n".join(f"- {m}" for m in request.materials_used)
    issues_str = "\n".join(f"- {i}" for i in request.issues_encountered) if request.issues_encountered else "None reported"

    prompt = f"""
You are a construction site manager. Generate a professional daily site report.

Site: {request.site_name}
Date: {request.date}
Workers Present: {request.workers_present}
Weather: {request.weather_conditions or 'Not specified'}

Work Completed:
{work_str}

Materials Used:
{materials_str}

Issues Encountered:
{issues_str}

Next Day Plan: {request.next_day_plan or 'To be determined'}

Generate a professional daily report as JSON:
{{
  "report_header": {{
    "site_name": "{request.site_name}",
    "date": "{request.date}",
    "report_number": "DR-{request.date.replace('-', '')}",
    "prepared_by": "ConstructAI System"
  }},
  "executive_summary": "<2-3 sentence summary of the day>",
  "productivity_assessment": {{
    "rating": "EXCELLENT|GOOD|FAIR|POOR",
    "score": <integer 1-10>,
    "commentary": "<assessment>"
  }},
  "work_progress": {{
    "completed_activities": ["{request.work_completed[0] if request.work_completed else ''}"],
    "completion_percentage_estimate": <number>,
    "quality_notes": "<quality observations>"
  }},
  "resource_utilization": {{
    "manpower": {{"present": {request.workers_present}, "productivity_note": "<note>"}},
    "materials_consumption": "<summary>",
    "equipment_status": "<status>"
  }},
  "issues_and_resolutions": [
    {{"issue": "<issue>", "impact": "LOW|MEDIUM|HIGH", "resolution": "<action taken or recommended>"}}
  ],
  "safety_summary": {{
    "incidents": 0,
    "near_misses": 0,
    "safety_observations": ["<observation>"]
  }},
  "next_day_activities": ["<planned activity>"],
  "material_requirements_tomorrow": ["<material needed>"],
  "action_items": [
    {{"action": "<action>", "responsible": "<role>", "deadline": "<timeline>"}}
  ],
  "overall_project_health": "ON_TRACK|SLIGHTLY_DELAYED|SIGNIFICANTLY_DELAYED|AHEAD_OF_SCHEDULE"
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
        import json
        result = json.loads(text)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
