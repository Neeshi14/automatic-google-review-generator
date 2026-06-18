import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Business, ReviewSession
from app.schemas import BusinessCreate, BusinessPublic, BusinessResponse, DashboardResponse
from app.services.qr_service import generate_qr_code, public_qr_url


router = APIRouter(prefix="/api/businesses", tags=["businesses"])
dashboard_router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or uuid.uuid4().hex[:8]


def unique_slug(db: Session, name: str) -> str:
    base = slugify(name)
    slug = base
    counter = 2
    while db.scalar(select(Business.id).where(Business.business_slug == slug)):
        slug = f"{base}-{counter}"
        counter += 1
    return slug


@router.post("", status_code=status.HTTP_201_CREATED, response_model=BusinessResponse)
def create_business(payload: BusinessCreate, db: Session = Depends(get_db)) -> BusinessResponse:
    slug = unique_slug(db, payload.business_name)
    qr_code_path, review_page_url = generate_qr_code(slug)
    business = Business(
        business_name=payload.business_name,
        business_slug=slug,
        google_review_url=payload.google_review_url,
        business_category=payload.business_category,
        tone_preference=payload.tone_preference,
        qr_code_path=qr_code_path,
    )
    db.add(business)
    db.commit()
    db.refresh(business)
    return BusinessResponse(
        business_id=business.id,
        business_name=business.business_name,
        business_slug=business.business_slug,
        review_page_url=review_page_url,
        qr_code_url=public_qr_url(business.qr_code_path),
    )


@router.get("/{slug}", response_model=BusinessPublic)
def get_business(slug: str, db: Session = Depends(get_db)) -> BusinessPublic:
    business = db.scalar(select(Business).where(Business.business_slug == slug))
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")
    return BusinessPublic(
        business_id=business.id,
        business_name=business.business_name,
        business_slug=business.business_slug,
        business_category=business.business_category,
        tone_preference=business.tone_preference,
        google_review_url=business.google_review_url,
    )


@dashboard_router.get("/{business_id}", response_model=DashboardResponse)
def get_dashboard(business_id: uuid.UUID, db: Session = Depends(get_db)) -> DashboardResponse:
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    total_sessions = db.scalar(
        select(func.count(ReviewSession.id)).where(ReviewSession.business_id == business_id)
    ) or 0
    generated_sessions = db.scalar(
        select(func.count(ReviewSession.id)).where(
            ReviewSession.business_id == business_id,
            ReviewSession.generated_reviews.is_not(None),
        )
    ) or 0
    experience_rows = db.execute(
        select(ReviewSession.selected_experience, func.count(ReviewSession.id))
        .where(ReviewSession.business_id == business_id, ReviewSession.selected_experience.is_not(None))
        .group_by(ReviewSession.selected_experience)
        .order_by(func.count(ReviewSession.id).desc())
    ).all()
    recent_reviews = db.scalars(
        select(ReviewSession.selected_review)
        .where(ReviewSession.business_id == business_id, ReviewSession.selected_review.is_not(None))
        .order_by(ReviewSession.updated_at.desc())
        .limit(10)
    ).all()

    return DashboardResponse(
        business_id=business.id,
        business_name=business.business_name,
        business_slug=business.business_slug,
        qr_code_url=public_qr_url(business.qr_code_path),
        total_sessions=total_sessions,
        total_generated_sessions=generated_sessions,
        most_selected_experience=experience_rows[0][0] if experience_rows else None,
        recent_selected_reviews=list(recent_reviews),
        created_at=business.created_at,
    )
