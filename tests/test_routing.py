from app.core.routing import AGENCY_MAP, route_issue


def test_route_issue_covers_every_civic_category():
    for category in ("pothole_road", "drainage_sewage", "water_supply", "streetlight",
                      "garbage_waste", "footpath", "traffic_signage", "other"):
        agency = route_issue(category)
        assert agency == AGENCY_MAP[category]
        assert agency  # never empty


def test_route_issue_falls_back_to_general_cell_for_unknown_category():
    assert route_issue("not_a_real_category") == AGENCY_MAP["other"]


def test_route_issue_is_deterministic():
    assert route_issue("pothole_road") == route_issue("pothole_road")
