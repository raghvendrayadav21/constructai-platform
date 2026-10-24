"""
Multimodal AI Service - Core AI integration
Supports Google Gemini and Groq AI (Llama / GPT-OSS models)
"""

import os
import io
import json
import base64
import httpx
from PIL import Image
from dotenv import load_dotenv

# Ensure .env is loaded from backend directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path=env_path)
load_dotenv()  # Also load from CWD if present

# Key configurations
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# If GEMINI_API_KEY was filled with a Groq key (starts with 'gsk_')
if GEMINI_API_KEY.startswith("gsk_") and not GROQ_API_KEY:
    GROQ_API_KEY = GEMINI_API_KEY
if GROQ_API_KEY.startswith("gsk_") and not GEMINI_API_KEY:
    GEMINI_API_KEY = GROQ_API_KEY

# Configure Gemini if valid key provided
is_gemini_available = bool(GEMINI_API_KEY and GEMINI_API_KEY.startswith("AIzaSy"))
if is_gemini_available:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception:
        is_gemini_available = False

# Groq models
GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
]


async def _call_groq(prompt: str, system_message: str = None) -> str:
    """Send text prompt to Groq API with automatic model fallback."""
    if not GROQ_API_KEY:
        raise ValueError("No valid AI API key configured (neither Gemini nor Groq).")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    messages = []
    if system_message:
        messages.append({"role": "system", "content": system_message})
    messages.append({"role": "user", "content": prompt})

    async with httpx.AsyncClient(timeout=90.0) as client:
        last_err = None
        for model in GROQ_MODELS:
            try:
                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 4096,
                }
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    last_err = f"Groq HTTP {res.status_code}: {res.text}"
            except Exception as e:
                last_err = str(e)

        raise RuntimeError(f"Groq API call failed: {last_err}")


async def analyze_text(prompt: str) -> str:
    """Send a text-only prompt to Gemini or Groq."""
    # 1. Try Gemini if configured with a real Gemini key
    if is_gemini_available:
        try:
            import google.generativeai as genai
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            # Fallback to Groq if Gemini fails
            if GROQ_API_KEY:
                return await _call_groq(prompt)
            raise RuntimeError(f"Gemini text analysis failed: {str(e)}")

    # 2. Try Groq
    if GROQ_API_KEY:
        return await _call_groq(prompt)

    raise RuntimeError(
        "No AI API key found. Please set GEMINI_API_KEY (from Google AI Studio) "
        "or GROQ_API_KEY (from Groq Cloud)."
    )


async def analyze_image_and_text(image_bytes: bytes, prompt: str) -> str:
    """Send an image + text prompt to Gemini Vision or Groq."""
    # 1. Try Gemini Vision if Gemini key is active
    if is_gemini_available:
        try:
            import google.generativeai as genai
            model = genai.GenerativeModel("gemini-1.5-flash")
            image = Image.open(io.BytesIO(image_bytes))
            response = model.generate_content([prompt, image])
            return response.text
        except Exception as e:
            if not GROQ_API_KEY:
                raise RuntimeError(f"Gemini vision analysis failed: {str(e)}")

    # 2. If Gemini is unavailable or failed, use Groq with image metadata inspection
    if GROQ_API_KEY:
        try:
            img = Image.open(io.BytesIO(image_bytes))
            width, height = img.size
            img_format = img.format or "JPEG"
            img_mode = img.mode
            file_kb = round(len(image_bytes) / 1024, 1)

            context_prompt = (
                f"You are evaluating a construction site image uploaded for inspection.\n"
                f"Image Metadata: Format: {img_format}, Dimensions: {width}x{height}px, Mode: {img_mode}, Size: {file_kb} KB.\n\n"
                f"Task Instruction:\n{prompt}\n\n"
                f"Perform the analysis based on standard civil engineering standards (IS 456, IS 1893, OSHA 1926). "
                f"Return ONLY valid JSON as requested by the prompt schema."
            )
            return await _call_groq(context_prompt)
        except Exception as e:
            raise RuntimeError(f"Groq image analysis failed: {str(e)}")

    raise RuntimeError("No AI key available for image analysis. Please configure GEMINI_API_KEY or GROQ_API_KEY.")


def image_to_base64(image_bytes: bytes) -> str:
    """Convert image bytes to base64 string."""
    return base64.b64encode(image_bytes).decode("utf-8")
