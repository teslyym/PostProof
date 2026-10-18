import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException

from . import config
from .models import Claim, VerifyRequest
from .nipost import NipostError, lookup

app = FastAPI(
    title="PostProof",
    description="Verify, don't reveal: consented address attestations on Nigeria's postcode.",
)

AUDIT_FILE = Path("audit.jsonl")

WITHHELD = ["street / house address", "locality and zone", "building details", "coordinates"]

STATUS_MAP = {401: 502, 402: 402, 403: 403, 429: 429}


def _audit(entry: dict) -> None:
    with AUDIT_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


@app.get("/health")
def health():
    return {"status": "ok", "mode": config.MODE, "source": config.source_label()}


@app.post("/verify")
async def verify(req: VerifyRequest):
    if not req.consent:
        raise HTTPException(status_code=403, detail="User consent is required for this check")

    # Spend as little as possible: only ask NIPOST for the level the claims need.
    level = 1
    if Claim.lga_match in req.requested:
        level = 2
    if Claim.residential in req.requested:
        level = 3

    try:
        data = await lookup(req.postcode, 1)  # L1: validity (free)
        valid = bool(data.get("valid"))
        if valid and level > 1:
            data = await lookup(req.postcode, level)  # only pay for L2/L3 if the code is real
    except NipostError as e:
        raise HTTPException(
            status_code=STATUS_MAP.get(e.status, 502),
            detail=f"{e.code}: {e.message}",
        )

    # Work out only the answers that were asked for. Raw address data stays.
    results: dict[str, bool] = {}
    if Claim.valid in req.requested:
        results["valid"] = valid
    if Claim.lga_match in req.requested:
        lga = (data.get("administrative_address") or {}).get("lga_name", "")
        results["lga_match"] = bool(valid and lga.strip().upper() == req.expected_lga.strip().upper())
    if Claim.residential in req.requested:
        results["residential"] = bool(valid and data.get("building_use_status") == "residential")

    attestation = {
        "attestation_id": str(uuid.uuid4()),
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "postcode": req.postcode,
        "results": results,
        "withheld": WITHHELD,
        "source": config.source_label(),
    }

    _audit(
        {
            "attestation_id": attestation["attestation_id"],
            "issued_at": attestation["issued_at"],
            "postcode_ref": hashlib.sha256(req.postcode.encode()).hexdigest()[:16],
            "claims": [c.value for c in req.requested],
            "results": results,
            "source": attestation["source"],
        }
    )
    return attestation


@app.get("/audit")
def audit(limit: int = 20):
    """The consent ledger: what was checked, when, and what was disclosed."""
    if not AUDIT_FILE.exists():
        return []
    lines = AUDIT_FILE.read_text(encoding="utf-8").splitlines()
    return [json.loads(line) for line in lines[-limit:]][::-1]