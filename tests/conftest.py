import pytest

from app.db import get_connection


@pytest.fixture
def db_conn():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.rollback()
        conn.close()


@pytest.fixture
def clean_wards(db_conn):
    with db_conn.cursor() as cur:
        cur.execute("TRUNCATE wards CASCADE")
    db_conn.commit()
    yield db_conn


@pytest.fixture
def clean_works(db_conn):
    with db_conn.cursor() as cur:
        cur.execute("TRUNCATE works CASCADE")
    db_conn.commit()
    yield db_conn
