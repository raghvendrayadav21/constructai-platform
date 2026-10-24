"""
Gemini AI Service - Core multimodal AI integration
Handles text and image-based prompts via Google Gemini
"""

import os
import base64
import google.generativeai as genai
from PIL import Image
import io
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
genai.configure(api_key=GEMINI_API_KEY)

# Model configuration
TEXT_MODEL = "gemini-1.5-flash"
VISION_MODEL = "gemini-1.5-flash"

GENERATION_CONFIG = genai.types.GenerationConfig(
    temperature=0.4,
    top_p=0.95,
    top_k=40,
    max_output_tokens=4096,
)


def get_text_model():
    """Return configured Gemini text model."""
    return genai.GenerativeModel(
        model_name=TEXT_MODEL,
        generation_config=GENERATION_CONFIG
    )


def get_vision_model():
    """Return configured Gemini vision model."""
    return genai.GenerativeModel(
        model_name=VISION_MODEL,
        generation_config=GENERATION_CONFIG
    )


async def analyze_text(prompt: str) -> str:
    """Send a text-only prompt to Gemini and return response."""
    try:
        model = get_text_model()
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise RuntimeError(f"Gemini text analysis failed: {str(e)}")


async def analyze_image_and_text(image_bytes: bytes, prompt: str) -> str:
    """Send an image + text prompt to Gemini vision model."""
    try:
        model = get_vision_model()
        image = Image.open(io.BytesIO(image_bytes))
        response = model.generate_content([prompt, image])
        return response.text
    except Exception as e:
        raise RuntimeError(f"Gemini vision analysis failed: {str(e)}")


def image_to_base64(image_bytes: bytes) -> str:
    """Convert image bytes to base64 string."""
    return base64.b64encode(image_bytes).decode("utf-8")
