"""
Weather Advisory Router
Weather-aware construction advisory using OpenWeatherMap + Gemini AI
"""

import os
import json
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.gemini_service import analyze_text

router = APIRouter()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")
WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"


class WeatherAdvisoryRequest(BaseModel):
    city: str
    country_code: str = "IN"
    construction_phase: str = "general"  # foundation, structure, finishing, etc.
    activities_planned: list[str] = []


async def fetch_weather(city: str, country_code: str) -> dict:
    """Fetch current weather + 5-day forecast from OpenWeatherMap."""
    if not WEATHER_API_KEY or WEATHER_API_KEY == "your_openweathermap_api_key_here":
        # Return mock weather for demo purposes
        return {
            "mock": True,
            "city": city,
            "current": {
                "temp_celsius": 28,
                "feels_like": 32,
                "humidity": 75,
                "description": "Partly cloudy",
                "wind_speed_kmh": 15,
                "visibility_km": 8,
                "uv_index": 6
            },
            "forecast_days": [
                {"day": "Today", "high": 30, "low": 24, "condition": "Partly cloudy", "rain_chance": 20},
                {"day": "Tomorrow", "high": 28, "low": 22, "condition": "Light rain", "rain_chance": 70},
                {"day": "Day 3", "high": 31, "low": 25, "condition": "Sunny", "rain_chance": 5},
                {"day": "Day 4", "high": 29, "low": 23, "condition": "Cloudy", "rain_chance": 30},
                {"day": "Day 5", "high": 27, "low": 21, "condition": "Thunderstorm", "rain_chance": 85},
            ]
        }

    try:
        async with httpx.AsyncClient() as client:
            # Current weather
            current_resp = await client.get(
                f"{WEATHER_BASE_URL}/weather",
                params={"q": f"{city},{country_code}", "appid": WEATHER_API_KEY, "units": "metric"}
            )
            current_data = current_resp.json()

            # 5-day forecast
            forecast_resp = await client.get(
                f"{WEATHER_BASE_URL}/forecast",
                params={"q": f"{city},{country_code}", "appid": WEATHER_API_KEY, "units": "metric", "cnt": 40}
            )
            forecast_data = forecast_resp.json()

            return {
                "mock": False,
                "city": current_data.get("name", city),
                "current": {
                    "temp_celsius": round(current_data["main"]["temp"], 1),
                    "feels_like": round(current_data["main"]["feels_like"], 1),
                    "humidity": current_data["main"]["humidity"],
                    "description": current_data["weather"][0]["description"].title(),
                    "wind_speed_kmh": round(current_data["wind"]["speed"] * 3.6, 1),
                    "visibility_km": current_data.get("visibility", 10000) / 1000,
                    "rain_1h_mm": current_data.get("rain", {}).get("1h", 0)
                },
                "forecast_days": [
                    {
                        "day": f["dt_txt"][:10],
                        "temp": round(f["main"]["temp"], 1),
                        "condition": f["weather"][0]["description"].title(),
                        "rain_chance": round(f.get("pop", 0) * 100)
                    }
                    for f in forecast_data.get("list", [])[:5]
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Weather service unavailable: {str(e)}")


@router.post("/advisory")
async def get_weather_advisory(request: WeatherAdvisoryRequest):
    """Get weather data + AI construction advisory."""
    weather_data = await fetch_weather(request.city, request.country_code)
    activities_str = ", ".join(request.activities_planned) if request.activities_planned else "General construction activities"

    prompt = f"""
You are a construction weather specialist. Based on the following weather data, provide
detailed construction advisory for a site in {request.city}.

Current Weather:
- Temperature: {weather_data['current']['temp_celsius']}°C (feels like {weather_data['current']['feels_like']}°C)
- Humidity: {weather_data['current']['humidity']}%
- Conditions: {weather_data['current']['description']}
- Wind Speed: {weather_data['current']['wind_speed_kmh']} km/h
- Visibility: {weather_data['current']['visibility_km']} km

5-Day Forecast: {json.dumps(weather_data['forecast_days'], indent=2)}

Construction Phase: {request.construction_phase}
Planned Activities: {activities_str}

Return a detailed JSON advisory:
{{
  "overall_suitability": "EXCELLENT|GOOD|CAUTION|AVOID",
  "suitability_score": <integer 0-100>,
  "today_summary": "<brief assessment for today>",
  "activity_advisories": [
    {{
      "activity": "<activity name>",
      "suitability": "PROCEED|PROCEED_WITH_CAUTION|POSTPONE|CANCEL",
      "reason": "<why>",
      "best_time": "<time recommendation>"
    }}
  ],
  "weather_risks": [
    {{"risk": "<risk>", "severity": "LOW|MEDIUM|HIGH", "construction_impact": "<impact>"}}
  ],
  "daily_forecast_advisory": [
    {{"day": "<day>", "conditions": "<summary>", "construction_advice": "<advice>", "suitability": "GOOD|CAUTION|AVOID"}}
  ],
  "concrete_pouring_advice": "<specific advice for concrete work>",
  "worker_safety_advisory": {{
    "heat_stress_risk": "LOW|MEDIUM|HIGH",
    "hydration_reminder": true|false,
    "lightning_risk": true|false,
    "recommended_work_hours": "<e.g., 6am-11am and 4pm-7pm>",
    "ppe_recommendations": ["<ppe item>"]
  }},
  "material_storage_advice": "<advice for material protection>",
  "equipment_advisory": "<advice for equipment operation>",
  "weekend_planning": "<advice for weekend/next 48 hours>",
  "alerts": ["<any critical weather alerts>"]
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
        advisory = json.loads(text)
        return {
            "success": True,
            "weather_data": weather_data,
            "advisory": advisory
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
