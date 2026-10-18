import os

from dotenv import load_dotenv

load_dotenv()

MODE = os.getenv("POSTPROOF_MODE", "mock").lower()
API_KEY = os.getenv("NIPOST_API_KEY", "")
BASE_URL = os.getenv("NIPOST_BASE_URL", "https://api.postcode.gov.ng")

if MODE not in ("mock", "nipost"):
    raise RuntimeError("POSTPROOF_MODE must be 'mock' or 'nipost'")

if MODE == "nipost" and not API_KEY:
    raise RuntimeError("NIPOST_API_KEY is missing from .env")


def source_label() -> str:
    if MODE == "mock":
        return "mock"
    if API_KEY.startswith("nipost_test_"):
        return "nipost-sandbox"
    return "nipost-live"