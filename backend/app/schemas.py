import re
import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


GOOGLE_REVIEW_PATTERN = re.compile(
    r"^https://(www\.)?(g\.page|search\.google\.com|google\.com|maps\.app\.goo\.gl|goo\.gl)/.+",
    re.I,
)
EXPERIENCES = {"Excellent", "Good", "Average"}
TONES = {"friendly", "professional", "short", "detailed", "emotional"}


class BusinessCreate(BaseModel):
    business_name: str = Field(min_length=2, max_length=160)
    google_review_url: str = Field(min_length=10, max_length=2000)
    business_category: str = Field(min_length=2, max_length=80)
    tone_preference: str = Field(default="friendly", max_length=40)

    @field_validator("google_review_url")
    @classmethod
    def validate_google_url(cls, value: str) -> str:
        value = value.strip()
        if not GOOGLE_REVIEW_PATTERN.match(value):
            raise ValueError("Enter a valid Google review URL.")
        return value

    @field_validator("business_name", "business_category")
    @classmethod
    def clean_text(cls, value: str) -> str:
        return " ".join(value.strip().split())

    @field_validator("tone_preference")
    @classmethod
    def validate_tone(cls, value: str) -> str:
        value = value.strip().lower()
        if value not in TONES:
            raise ValueError("Choose a supported review tone.")
        return value


class BusinessResponse(BaseModel):
    business_id: uuid.UUID
    business_name: str
    business_slug: str
    review_page_url: str
    qr_code_url: str


class UserPublic(BaseModel):
    user_id: uuid.UUID
    name: str
    email: str
    business_id: uuid.UUID | None = None


class AuthRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=6, max_length=128)

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return value.strip().lower()


class SignupRequest(AuthRequest):
    name: str = Field(min_length=2, max_length=120)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return " ".join(value.strip().split())


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class BusinessPublic(BaseModel):
    business_id: uuid.UUID
    business_name: str
    business_slug: str
    business_category: str
    tone_preference: str
    google_review_url: str


class ReviewSessionCreate(BaseModel):
    business_id: uuid.UUID


class ReviewSessionResponse(BaseModel):
    session_id: uuid.UUID
    session_token: str


class GenerateReviewsRequest(BaseModel):
    experience: str
    keywords: list[str] = Field(default_factory=list, max_length=7)

    @field_validator("experience")
    @classmethod
    def validate_experience(cls, value: str) -> str:
        value = value.strip().title()
        if value not in EXPERIENCES:
            raise ValueError("Choose Excellent, Good, or Average.")
        return value

    @field_validator("keywords")
    @classmethod
    def clean_keywords(cls, values: list[str]) -> list[str]:
        cleaned = []
        for value in values:
            item = " ".join(str(value).strip().split())
            if item and item not in cleaned:
                cleaned.append(item[:80])
        return cleaned[:7]


class GenerateReviewsResponse(BaseModel):
    reviews: list[str]
    remaining_generations: int


class SelectedReviewRequest(BaseModel):
    selected_review: str = Field(min_length=5, max_length=2000)


class SelectedReviewResponse(BaseModel):
    session_token: str
    selected_review: str


class DashboardResponse(BaseModel):
    business_id: uuid.UUID
    business_name: str
    business_slug: str
    qr_code_url: str
    total_sessions: int
    total_generated_sessions: int
    most_selected_experience: str | None
    recent_selected_reviews: list[str]
    created_at: datetime
