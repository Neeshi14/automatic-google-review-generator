import json
import re
import secrets

import google.generativeai as genai

from app.config import get_settings
from app.models import Business


SYSTEM_INSTRUCTION = """
You write realistic first-person Google review drafts for real customers.

Quality requirements:
- Sound like a genuine customer typing a normal Google review, not an advertisement, slogan, or AI template.
- Use specific but safe details from the provided business category and selected keywords.
- Do not invent names, staff names, exact prices, dates, discounts, locations, timelines, guarantees, or outcomes that were not provided.
- Avoid childish, silly, exaggerated, or empty phrases such as "very good", "nice place", "awesome service", "best ever", or "I had a good experience" as the main content.
- Avoid overly polished phrases such as "positive impression", "worth recommending", "seamless experience", "exceeded expectations", "from start to finish", or "highly professional" unless they genuinely fit.
- Each review must have a slightly different angle, sentence structure, and word choice.
- Write in natural everyday English with 1 sentence, or 2 short sentences when it sounds better.
- Keep reviews medium length for this app: 15 to 20 words. Do not write long paragraphs.
- Keep the review credible for Google: no pressure, no fake claims, no medical/legal/financial promises, no mention of AI or generated text.
- The customer's selected experience controls intensity:
  - Excellent: warm, confident, appreciative, but not overhyped.
  - Good: positive and balanced, with room for normal human wording.
  - Average: fair, calm, and constructive, not harsh or fake-positive.
- Return only valid JSON: an array of exactly 10 strings.
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
Create 10 natural Google review draft options for one real customer.

Inputs:
- Selected experience: {experience}
- Business category: {category}
- Preferred tone: {tone}
- Customer-selected keywords: {', '.join(keywords) if keywords else 'none'}
- Random session seed: {nonce}

Writing guidance:
- Generate brand-new wording for this request. Do not reuse earlier fallback/template review sentences.
- Make every review sound like a real person wrote it on Google after visiting the business.
- Use simple human wording, including small natural imperfections in phrasing, but keep grammar clean.
- Avoid sounding too polished, promotional, formal, poetic, or template-like.
- Use the keywords as realistic points of focus, not as a comma-separated list.
- If no keywords are provided, infer only broad category-safe details.
- Avoid repeating the same opening across reviews.
- Make the reviews sound like different real customers could have written them, not one writer changing a few words.
- Keep every review medium length for this app: 15 to 20 words.
- Use 1 natural sentence, or 2 very short sentences only when needed.
- Do not create short one-liners, long paragraphs, bullet points, or overly detailed stories.
- Do not make every review perfect or dramatic. Keep them believable and grounded.

Output only a valid JSON array of exactly 10 strings.
""".strip()

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(
            "gemini-2.0-flash",
            system_instruction=SYSTEM_INSTRUCTION,
            generation_config={
                "temperature": 0.85,
                "top_p": 0.92,
                "top_k": 40,
            },
        )
        response = await model.generate_content_async(prompt)
        return _extract_json_array(response.text or "")
    except Exception as exc:
        raise RuntimeError("AI review generation failed. Please try again.") from exc
