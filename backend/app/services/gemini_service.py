import json
import re
import secrets

import google.generativeai as genai

from app.config import get_settings
from app.models import Business


SYSTEM_INSTRUCTION = """
Write realistic first-person Google review drafts for real customers.
Use only the supplied category, tone, experience, and keywords. Do not invent staff names, prices, dates, offers, locations, promises, or outcomes.
Each review must sound natural, specific, and credible, not promotional, fake, childish, or AI-written.
Match intensity to experience: Excellent = warm/confident, Good = positive/balanced, Average = calm/constructive.
Return only valid JSON: exactly 10 strings, each 15-20 words, with varied wording and openings.
""".strip()


def _extract_json_array(text: str) -> list[str]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.I).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()

    match = re.search(r"\[[\s\S]*\]", cleaned)
    parsed = json.loads(match.group(0) if match else cleaned)
    if not isinstance(parsed, list):
        raise ValueError("Gemini response was not a JSON array.")

    reviews = [str(item).strip() for item in parsed if str(item).strip()]
    if len(reviews) != 10:
        raise ValueError("Gemini did not return exactly 10 reviews.")
    return reviews


async def generate_review_suggestions(business: Business, experience: str, keywords: list[str]) -> list[str]:
    settings = get_settings()
    nonce = secrets.token_hex(8)
    category = business.business_category
    tone = business.tone_preference

    if not settings.gemini_api_key:
        raise RuntimeError("AI review generation is not configured. Add GEMINI_API_KEY to generate fresh reviews.")

    prompt = f"""
Create 10 fresh Google review drafts.
Experience: {experience}
Category: {category}
Tone: {tone}
Keywords: {', '.join(keywords) if keywords else 'none'}
Seed: {nonce}

Use keywords naturally, not as a list. If keywords are none, use only category-safe details.
Output JSON array only.
""".strip()

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(
            "gemini-2.0-flash",
            system_instruction=SYSTEM_INSTRUCTION,
            generation_config={
                "temperature": 0.75,
                "top_p": 0.92,
                "top_k": 40,
                "max_output_tokens": 700,
                "response_mime_type": "application/json",
            },
        )
        response = await model.generate_content_async(prompt)
        return _extract_json_array(response.text or "")
    except Exception as exc:
        raise RuntimeError("AI review generation failed. Please try again.") from exc
