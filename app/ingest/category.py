CIVIC_CATEGORY_KEYWORDS = {
    "pothole_road": [
        "pothole", "road concret", "road construction", "tar road", "asphalt",
        "resurfac", "cc road", "carpet road", "road widening", "road repair",
    ],
    "drainage_sewage": [
        "drainage", "sewage", "sewer", "storm water", "waterlogging", "nala", "gutter",
    ],
    "water_supply": [
        "water supply", "water tank", "borewell", "bore well", "pipeline",
        "drinking water", "water pump", "overhead tank",
    ],
    "streetlight": [
        "street light", "streetlight", "led light", "lighting", "lamp post",
    ],
    "garbage_waste": [
        "garbage", "waste management", "solid waste", "dustbin", "sanitation", "compost",
    ],
    "footpath": [
        "footpath", "pavement", "walkway", "foot path",
    ],
    "traffic_signage": [
        "traffic signal", "signage", "zebra crossing", "speed breaker",
        "road safety", "traffic sign",
    ],
}


def map_work_category(description: str) -> str:
    """Maps a free-text MPLADS work description onto our civic_category enum.

    workCategory in the source data ("Normal/Others", "Trust and Society", ...)
    is almost entirely uninformative for this purpose, so classification runs
    on workDescription keywords instead. Most MPLADS works fund things outside
    our 8 categories entirely (community halls, trusts, equipment) and
    correctly fall to 'other' rather than being forced into a wrong bucket.
    """
    text = (description or "").lower()
    for category, keywords in CIVIC_CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return category
    return "other"
