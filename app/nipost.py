import httpx

from . import config


class NipostError(Exception):
    def __init__(self, status: int, code: str, message: str):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message


# Mock data (only used when POSTPROOF_MODE=mock).
_MOCK = {
    "EK-01-A03-FK-01": {
        "administrative_address": {
            "state_name": "EKITI",
            "lga_name": "ADO EKITI",
            "locality_name": "ADO EKITI",
            "zone": "SOUTH WEST",
        },
        "recent_house_address": {"recent": "NTA ROAD, BACK OF FABIAN HOTEL, ADO EKITI"},
        "building_use_status": "residential",
    },
    "FC-02-A09-DB-09": {
        "administrative_address": {
            "state_name": "FEDERAL CAPITAL TERRITORY",
            "lga_name": "ABUJA MUNICIPAL",
            "locality_name": "THREE ARMS ZONE",
            "zone": "NORTH CENTRAL",
        },
        "recent_house_address": {"recent": "MOCK PUBLIC BUILDING, THREE ARMS ZONE"},
        "building_use_status": "public",
    },
}


def _mock_lookup(code: str, level: int) -> dict:
    """Behaves like the real API: higher levels add more fields."""
    record = _MOCK.get(code)
    if record is None:
        return {"postcode": code, "valid": False}
    data = {"postcode": code, "valid": True}
    if level >= 2:
        data["administrative_address"] = record["administrative_address"]
        data["recent_house_address"] = record["recent_house_address"]
    if level >= 3:
        data["building_use_status"] = record["building_use_status"]
    return data


#  NIPOST API
async def lookup(code: str, level: int) -> dict:
    """GET /v1/lookup. Level 1 = validity only (free). 2-3 add more (credits on live keys)."""
    if config.MODE == "mock":
        return _mock_lookup(code, level)

    try:
        async with httpx.AsyncClient(base_url=config.BASE_URL, timeout=10.0) as client:
            resp = await client.get(
                "/v1/lookup",
                params={"code": code, "level": level},
                headers={"X-API-Key": config.API_KEY},
            )
    except httpx.HTTPError as exc:
        raise NipostError(502, "upstream_unreachable", f"Could not reach NIPOST ({exc.__class__.__name__})")

    if resp.status_code == 404:
        return {"postcode": code, "valid": False}

    if resp.status_code != 200:
        try:
            err = resp.json().get("error", {})
        except ValueError:
            err = {}
        raise NipostError(
            resp.status_code,
            err.get("code", "upstream_error"),
            err.get("message", "NIPOST API error"),
        )

    return resp.json().get("data", {})