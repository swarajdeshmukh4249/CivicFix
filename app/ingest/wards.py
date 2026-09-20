import json

from app.db import get_connection


def load_wards(geojson_path: str) -> int:
    """Load PMC ward boundaries from GeoJSON into the wards table.

    Ward id is taken from the `wardnum` property so it stays stable across
    reloads and can be referenced directly (e.g. from a "ward no. N" regex
    match during location extraction elsewhere in the pipeline).
    """
    with open(geojson_path) as f:
        collection = json.load(f)

    features = collection["features"]

    with get_connection() as conn:
        with conn.cursor() as cur:
            for feature in features:
                props = feature["properties"]
                ward_id = props["wardnum"]
                name = props.get("Name2") or props["Name1"]
                geom_json = json.dumps(feature["geometry"])
                cur.execute(
                    """
                    INSERT INTO wards (id, name, geom)
                    VALUES (%s, %s, ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)))
                    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, geom = EXCLUDED.geom
                    """,
                    (ward_id, name, geom_json),
                )
            cur.execute(
                "SELECT setval(pg_get_serial_sequence('wards', 'id'), (SELECT max(id) FROM wards))"
            )
        conn.commit()

    return len(features)
