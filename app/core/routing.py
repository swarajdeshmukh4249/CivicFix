"""Work-order routing: a fixed category -> agency lookup table, not a
model - same "formula, not prediction" philosophy as app/core/priority.py
and app/nlp/severity.py. Pune Municipal Corporation's actual department
structure is public; this maps each civic_category to the department that
owns it.
"""

AGENCY_MAP = {
    "pothole_road": "PMC Road Department",
    "drainage_sewage": "PMC Sewage & Drainage Department",
    "water_supply": "PMC Water Supply Department",
    "streetlight": "PMC Electrical Department",
    "garbage_waste": "PMC Solid Waste Management Department",
    "footpath": "PMC Road Department",
    "traffic_signage": "PMC Traffic Planning Department",
    "other": "PMC General Complaints Cell",
}


def route_issue(category: str) -> str:
    return AGENCY_MAP.get(category, AGENCY_MAP["other"])
