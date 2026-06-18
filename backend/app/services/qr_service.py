from pathlib import Path

import qrcode

from app.config import get_settings


QRCODE_DIR = Path(__file__).resolve().parents[1] / "static" / "qrcodes"


def generate_qr_code(slug: str) -> tuple[str, str]:
    settings = get_settings()
    QRCODE_DIR.mkdir(parents=True, exist_ok=True)

    review_url = f"{str(settings.frontend_url).rstrip('/')}/review/{slug}"
    file_path = QRCODE_DIR / f"{slug}.png"

    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(review_url)
    qr.make(fit=True)
    image = qr.make_image(fill_color="black", back_color="white")
    image.save(file_path)

    return f"static/qrcodes/{slug}.png", review_url


def public_qr_url(qr_code_path: str) -> str:
    settings = get_settings()
    return f"{str(settings.backend_url).rstrip('/')}/{qr_code_path.lstrip('/')}"
