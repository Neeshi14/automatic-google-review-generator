import json
import random
import re
import secrets

import google.generativeai as genai

from app.config import get_settings
from app.models import Business


def _fallback_reviews(experience: str, category: str, tone: str, keywords: list[str]) -> list[str]:
    keyword_text = ", ".join(keywords) if keywords else "the overall experience"
    starts = [
        "I had a {experience} experience with this {category}.",
        "My visit was {experience}, and the {keyword_text} stood out.",
        "This {category} made a positive impression on me.",
        "I was happy with my experience here.",
        "The service matched what I was hoping for.",
        "I had a smooth and pleasant visit.",
        "This place gave me a {experience} overall experience.",
        "I appreciated the way the team handled my visit.",
        "Everything felt comfortable and easy from start to finish.",
        "Based on my visit, I would recommend this {category}.",
    ]
    reviews = []
    for idx, template in enumerate(starts):
        base = template.format(experience=experience.lower(), category=category.lower(), keyword_text=keyword_text.lower())
        if tone == "short":
            review = f"{base} I would consider coming back based on what I experienced."
        elif tone == "detailed":
            review = f"{base} The things that stood out to me were {keyword_text.lower()}, and the service felt consistent with my visit."
        else:
            review = f"{base} It felt genuine, helpful, and worth recommending based on my own experience."
        reviews.append(review)
    random.shuffle(reviews)
    return reviews


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
        return _fallback_reviews(experience, category, tone, keywords)

    prompt = (
        "You are helping a real customer write a Google review based only on their selected experience. "
        "Do not invent specific facts that were not provided. Do not mention names, dates, discounts, "
        "medical/legal claims, or unrealistic guarantees. Create 10 unique, natural-sounding review options. "
        "Keep each review between 20 and 60 words. "
        f"The review should match this experience: {experience}. "
        f"Business category: {category}. "
        f"Tone: {tone}. "
        f"Customer-selected keywords: {', '.join(keywords) if keywords else 'none'}. "
        f"Random session seed: {nonce}. "
        "Output only a valid JSON array of 10 strings."
    )

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = await model.generate_content_async(prompt)
        return _extract_json_array(response.text or "")
    except Exception:
        return _fallback_reviews(experience, category, tone, keywords)
