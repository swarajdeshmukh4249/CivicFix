import io

import pytest
from PIL import Image, ImageDraw

from app.nlp.photo_severity import estimate_photo_severity


def _jpeg_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_plain_uniform_image_scores_cosmetic():
    img = Image.new("RGB", (200, 200), color=(180, 180, 180))
    result = estimate_photo_severity(_jpeg_bytes(img))
    assert result["band"] == "cosmetic"
    assert 0.0 <= result["score"] < 0.32


def test_busy_dark_high_contrast_image_scores_higher_than_plain():
    plain = Image.new("RGB", (200, 200), color=(180, 180, 180))
    busy = Image.new("RGB", (200, 200), color=(15, 15, 15))
    draw = ImageDraw.Draw(busy)
    for i in range(0, 200, 8):
        draw.line([(i, 0), (200 - i, 200)], fill=(220, 40, 40), width=2)

    plain_result = estimate_photo_severity(_jpeg_bytes(plain))
    busy_result = estimate_photo_severity(_jpeg_bytes(busy))
    assert busy_result["score"] > plain_result["score"]
    assert busy_result["band"] in ("moderate", "critical")


def test_score_and_band_are_deterministic_for_the_same_image():
    img = Image.new("RGB", (150, 150), color=(90, 60, 30))
    data = _jpeg_bytes(img)
    assert estimate_photo_severity(data) == estimate_photo_severity(data)


def test_score_is_always_between_0_and_1():
    img = Image.new("RGB", (150, 150), color=(0, 0, 0))
    result = estimate_photo_severity(_jpeg_bytes(img))
    assert 0.0 <= result["score"] <= 1.0


def test_undecodable_bytes_raise_value_error():
    with pytest.raises(ValueError):
        estimate_photo_severity(b"not an image")
