from app.ingest.category import map_work_category


def test_road_construction_maps_to_pothole_road():
    assert map_work_category("Road Concreting at Ward No.11, Sutardara Kothrud.") == "pothole_road"


def test_drainage_description_maps_to_drainage_sewage():
    assert map_work_category(
        "The project aims to provide an effective drainage system for the proper "
        "disposal of surface and wastewater."
    ) == "drainage_sewage"


def test_streetlight_description_maps_to_streetlight():
    assert map_work_category("Installation of LED street light poles near the market") == "streetlight"


def test_unrelated_community_work_falls_back_to_other():
    assert map_work_category(
        "Construction of a public hall at Mulashi Khurd, Pune District"
    ) == "other"


def test_empty_description_falls_back_to_other():
    assert map_work_category("") == "other"
    assert map_work_category(None) == "other"
