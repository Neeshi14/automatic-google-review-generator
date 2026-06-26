import json
import logging
import re
import secrets

import google.generativeai as genai

from app.config import get_settings
from app.models import Business


logger = logging.getLogger(__name__)


SYSTEM_INSTRUCTION = """
Write realistic first-person Google review drafts for real customers.
Use only the supplied category, tone, experience, and keywords. Do not invent staff names, prices, dates, offers, locations, promises, or outcomes.
Each review must sound natural, specific, and credible, not promotional, fake, childish, or AI-written.
Match intensity to experience: Excellent = warm/confident, Good = positive/balanced, Average = calm/constructive.
Return only valid JSON: exactly 10 strings, each 15-20 words, with varied wording and openings.
""".strip()


def _fallback_review_suggestions(business: Business, experience: str, keywords: list[str]) -> list[str]:
    category = business.business_category.lower()
    focus_items = keywords or ["service", "quality", "overall experience"]
    focus_a = focus_items[0].lower()
    focus_b = focus_items[1].lower() if len(focus_items) > 1 else "the overall experience"
    focus_c = focus_items[2].lower() if len(focus_items) > 2 else "the work"

    if experience == "Average":
        return [
            f"The {category} experience was okay, with {focus_a} standing out more than the rest.",
            f"I had an average visit, but the {focus_b} made the experience feel fair overall.",
            f"The {category} work was decent, though I think the overall experience could be a little smoother.",
            f"I appreciated the {focus_a}, even though a few parts of the visit felt fairly normal.",
            f"The service felt acceptable, and the {focus_c} was handled in a clear, straightforward way.",
            f"My visit was neither bad nor excellent, but the {focus_b} was definitely useful.",
            f"The {category} experience was fine overall, with room to improve small details.",
            f"I found the {focus_a} helpful, though the full visit felt more average than exceptional.",
            f"The place handled things properly, and the {focus_c} matched what I expected.",
            f"It was a fair experience overall, with the {focus_b} being the strongest part for me.",
        ]

    if experience == "Good":
        return [
            f"I had a good experience with this {category}, especially because the {focus_a} felt reliable.",
            f"The {focus_b} stood out during my visit, and everything felt handled in a proper way.",
            f"I liked the overall experience here, with clear service and good attention to {focus_c}.",
            f"This {category} gave me a positive experience, and the {focus_a} made it feel worthwhile.",
            f"The visit went well, and I appreciated how the {focus_b} was handled without any fuss.",
            f"I was happy with the service overall, especially the way they managed {focus_c}.",
            f"Good experience from this {category}, with simple communication and a comfortable visit overall.",
            f"The {focus_a} was noticeable in a good way, and the full experience felt easy.",
            f"I found the {focus_b} helpful, and the service matched what I was hoping for.",
            f"Overall, this was a good visit, with the {focus_c} handled carefully and clearly.",
        ]

    return [
        f"I had an excellent experience with this {category}, especially because the {focus_a} felt genuinely strong.",
        f"The {focus_b} really stood out, and the whole visit felt smooth, clear, and comfortable.",
        f"I was very happy with the service here, especially the attention given to {focus_c}.",
        f"This {category} gave me a great experience, with {focus_a} that felt reliable and thoughtful.",
        f"The visit went really well, and I appreciated how naturally they handled {focus_b}.",
        f"I liked the overall experience a lot, especially the care shown in the {focus_c}.",
        f"Excellent service from this {category}, with a calm process and good attention throughout.",
        f"The {focus_a} made a strong impression, and everything felt handled with real care.",
        f"I would gladly come back because the {focus_b} and overall service both felt dependable.",
        f"Really positive experience overall, with the {focus_c} handled neatly and without unnecessary delay.",
    ]


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
        return _fallback_review_suggestions(business, experience, keywords)

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
            settings.gemini_model,
            system_instruction=SYSTEM_INSTRUCTION,
            generation_config={
                "candidate_count": 1,
                "temperature": 0.75,
                "top_p": 0.92,
                "top_k": 40,
                "max_output_tokens": 900,
            },
        )
        response = await model.generate_content_async(prompt)
        return _extract_json_array(response.text or "")
    except Exception as exc:
        logger.exception("Gemini review generation failed; using local fallback reviews.")
        return _fallback_review_suggestions(business, experience, keywords)
