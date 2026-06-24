import json
import random
import re
import secrets

import google.generativeai as genai

from app.config import get_settings
from app.models import Business


SYSTEM_INSTRUCTION = """
You write realistic first-person Google review drafts for real customers.

Quality requirements:
- Sound like a genuine customer, not an advertisement, slogan, or AI template.
- Use specific but safe details from the provided business category and selected keywords.
- Do not invent names, staff names, exact prices, dates, discounts, locations, timelines, guarantees, or outcomes that were not provided.
- Avoid childish, silly, exaggerated, or empty phrases such as "very good", "nice place", "awesome service", "best ever", or "I had a good experience" as the main content.
- Each review must have a slightly different angle, sentence structure, and word choice.
- Write in natural everyday English with 1 to 3 sentences.
- Keep the review credible for Google: no pressure, no fake claims, no medical/legal/financial promises, no mention of AI or generated text.
- The customer's selected experience controls intensity:
  - Excellent: warm, confident, appreciative, but not overhyped.
  - Good: positive and balanced, with room for normal human wording.
  - Average: fair, calm, and constructive, not harsh or fake-positive.
- Return only valid JSON: an array of exactly 10 strings.
""".strip()


def _humanize_label(value: str) -> str:
    return " ".join(str(value).strip().split()).lower()


def _fallback_reviews(experience: str, category: str, tone: str, keywords: list[str]) -> list[str]:
    category_text = _humanize_label(category) or "business"
    keyword_items = [_humanize_label(item) for item in keywords if _humanize_label(item)]
    focus = keyword_items[:3] or ["service", "communication", "overall experience"]
    if len(focus) == 1:
        focus_text = focus[0]
    elif len(focus) == 2:
        focus_text = f"{focus[0]} and {focus[1]}"
    else:
        focus_text = ", ".join(focus[:-1]) + f", and {focus[-1]}"

    if experience == "Average":
        starts = [
            f"My visit to this {category_text} was okay overall. I appreciated the {focus[0]}, though there is still room to make the experience feel more polished.",
            f"This {category_text} handled the basics properly, and details like {focus_text} were noticeable. A few small improvements would make the visit feel smoother.",
            f"I had a fair experience here. The {focus[0]} was helpful, but I would like to see a little more consistency next time.",
            f"The experience was decent and straightforward. Nothing felt confusing, and the {focus_text} helped, but it could be better with more attention to detail.",
            f"I found this {category_text} to be acceptable for what I needed. The team managed the visit well enough, especially around {focus[0]}.",
            f"My overall impression was balanced. There were some good parts, especially around {focus_text}, but the experience did not fully stand out.",
            f"This was a reasonable visit. The {focus[0]} worked for me, and I think a few refinements could make the service stronger.",
            f"I got what I needed from this {category_text}. The experience was manageable, and details like {focus_text} were the better parts of the visit.",
            f"The visit was neither bad nor exceptional. I appreciated the effort, and the {focus[0]} made the experience more comfortable.",
            f"This {category_text} gave me an average but useful experience. I would consider returning if the overall flow becomes a bit more consistent.",
        ]
    elif experience == "Good":
        starts = [
            f"I had a positive visit to this {category_text}. The {focus_text} made the experience feel smooth and easy to recommend.",
            f"This {category_text} handled my visit well. I especially noticed the {focus[0]}, which made the whole process feel more reliable.",
            f"My experience here was pleasant from start to finish. The {focus_text} stood out in a practical way without feeling overdone.",
            f"I liked how straightforward the service felt. This {category_text} made it easy to get what I needed, especially with the {focus[0]}.",
            f"The team gave a good impression during my visit. Details like {focus_text} made the experience feel organized and worth returning for.",
            f"I would recommend this {category_text} based on my visit. The experience felt clear, respectful, and supported by {focus[0]}.",
            f"This was a good experience overall. I appreciated the way details like {focus_text} were handled during my visit.",
            f"The visit felt comfortable and well managed. This {category_text} kept things simple, and the {focus[0]} added to the positive impression.",
            f"I left with a good impression of this {category_text}. The service felt steady, and details like {focus_text} were easy to notice.",
            f"Everything went smoothly during my visit. The {focus[0]} was a strong point, and I would be comfortable coming back again.",
        ]
    else:
        starts = [
            f"This {category_text} gave me a really strong experience. The {focus_text} made the visit feel professional, easy, and worth recommending.",
            f"I was genuinely impressed with how this {category_text} handled my visit. The {focus[0]} stood out and made the experience feel reliable.",
            f"My visit here went very well. The {focus_text} made the service feel thoughtful without being complicated.",
            f"I had a smooth and confident experience with this {category_text}. The way they handled {focus[0]} made a clear difference.",
            f"This is the kind of {category_text} I would be happy to return to. The {focus_text} made the whole visit feel well managed.",
            f"I appreciated the care and consistency during my visit. This {category_text} made the process feel easy, especially with the {focus[0]}.",
            f"The experience felt professional and comfortable throughout. The {focus_text} gave me a very positive impression.",
            f"I left feeling satisfied with my visit. This {category_text} paid attention to the right details, and the {focus[0]} stood out most.",
            f"This {category_text} made a strong impression on me. The service felt organized, respectful, and supported by {focus_text}.",
            f"I would gladly recommend this {category_text}. My visit felt smooth, and the {focus[0]} made the experience feel especially dependable.",
        ]

    reviews = starts
    if tone == "short":
        reviews = [review.split(". ")[0].rstrip(".") + "." for review in reviews]
    elif tone == "detailed":
        reviews = [
            f"{review} It felt based on real attention to the customer experience rather than just routine service."
            for review in reviews
        ]

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

    prompt = f"""
Create 10 polished Google review draft options for one real customer.

Inputs:
- Selected experience: {experience}
- Business category: {category}
- Preferred tone: {tone}
- Customer-selected keywords: {', '.join(keywords) if keywords else 'none'}
- Random session seed: {nonce}

Writing guidance:
- Use the keywords as realistic points of focus, not as a comma-separated list.
- If no keywords are provided, infer only broad category-safe details.
- Avoid repeating the same opening across reviews.
- Make the reviews sound like different real customers could have written them.
- Keep each review between 25 and 70 words unless the tone is "short"; for "short", use 12 to 28 words.
- Do not make every review perfect or dramatic. Keep them believable.

Output only a valid JSON array of exactly 10 strings.
""".strip()

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(
            "gemini-1.5-flash",
            system_instruction=SYSTEM_INSTRUCTION,
            generation_config={
                "temperature": 0.85,
                "top_p": 0.92,
                "top_k": 40,
            },
        )
        response = await model.generate_content_async(prompt)
        return _extract_json_array(response.text or "")
    except Exception:
        return _fallback_reviews(experience, category, tone, keywords)
