import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Business, ReviewSession
from app.schemas import (
    GenerateReviewsRequest,
    GenerateReviewsResponse,
    ReviewSessionCreate,
    ReviewSessionResponse,
    SelectedReviewRequest,
    SelectedReviewResponse,
)
from app.services.gemini_service import generate_review_suggestions


router = APIRouter(prefix="/api/review-sessions", tags=["review sessions"])


def get_session_or_404(db: Session, session_token: str) -> ReviewSession:
    review_session = db.scalar(select(ReviewSession).where(ReviewSession.session_token == session_token))
    if not review_session:
        raise HTTPException(status_code=404, detail="Review session not found.")
    return review_session


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ReviewSessionResponse)
def create_review_session(
    payload: ReviewSessionCreate,
    request: Request,
    db: Session = Depends(get_db),
) -> ReviewSessionResponse:
    business = db.get(Business, payload.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    if payload.client_session_id:
        existing_session = db.scalar(
            select(ReviewSession).where(
                ReviewSession.business_id == business.id,
                ReviewSession.client_session_id == payload.client_session_id,
            )
        )
        if existing_session:
            return ReviewSessionResponse(session_id=existing_session.id, session_token=existing_session.session_token)

    session = ReviewSession(
        business_id=business.id,
        session_token=secrets.token_urlsafe(32),
        client_session_id=payload.client_session_id,
        ip_address=request.client.host if request.client else "",
        user_agent=request.headers.get("user-agent", ""),
    )
    db.add(session)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        if payload.client_session_id:
            existing_session = db.scalar(
                select(ReviewSession).where(
                    ReviewSession.business_id == business.id,
                    ReviewSession.client_session_id == payload.client_session_id,
                )
            )
            if existing_session:
                return ReviewSessionResponse(session_id=existing_session.id, session_token=existing_session.session_token)
        raise
    db.refresh(session)
    return ReviewSessionResponse(session_id=session.id, session_token=session.session_token)


@router.post("/{session_token}/generate-reviews", response_model=GenerateReviewsResponse)
async def generate_reviews(
    session_token: str,
    payload: GenerateReviewsRequest,
    db: Session = Depends(get_db),
) -> GenerateReviewsResponse:
    settings = get_settings()
    review_session = get_session_or_404(db, session_token)
    if review_session.generation_count >= settings.max_generations_per_session:
        raise HTTPException(status_code=429, detail="This session has reached the review generation limit.")

    business = db.get(Business, review_session.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    try:
        reviews = await generate_review_suggestions(business, payload.experience, payload.keywords)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    review_session.selected_experience = payload.experience
    review_session.selected_keywords = payload.keywords
    review_session.generated_reviews = reviews
    review_session.generation_count += 1
    db.commit()

    return GenerateReviewsResponse(
        reviews=reviews,
        remaining_generations=max(settings.max_generations_per_session - review_session.generation_count, 0),
    )


@router.patch("/{session_token}/selected-review", response_model=SelectedReviewResponse)
def save_selected_review(
    session_token: str,
    payload: SelectedReviewRequest,
    db: Session = Depends(get_db),
) -> SelectedReviewResponse:
    review_session = get_session_or_404(db, session_token)
    review_session.selected_review = payload.selected_review.strip()
    db.commit()
    return SelectedReviewResponse(
        session_token=review_session.session_token,
        selected_review=review_session.selected_review,
    )
