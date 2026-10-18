import re
from enum import Enum

from pydantic import BaseModel, Field, field_validator, model_validator

# Format: AA-99-A99-AA-99 = state, LGA, district, area, building (11 characters)
POSTCODE_RE = re.compile(r"^[A-Z]{2}-\d{2}-[A-Z0-9]{3}-[A-Z]{2}-\d{2}$")


class Claim(str, Enum):
    valid = "valid"              # confirm if this is a real postcode?
    lga_match = "lga_match"      # confirm if it is in the LGA the relying party expects?
    residential = "residential"  # confirm if the building is residential?


def normalise_postcode(value: str) -> str:
    """Accepts 'ek01a03fk01', 'EK 01 A03 FK 01' or 'EK-01-A03-FK-01'."""
    raw = re.sub(r"[\s-]", "", value.upper())
    if len(raw) != 11:
        raise ValueError("Postcode must have 11 characters, e.g. EK-01-A03-FK-01")
    code = f"{raw[0:2]}-{raw[2:4]}-{raw[4:7]}-{raw[7:9]}-{raw[9:11]}"
    if not POSTCODE_RE.match(code):
        raise ValueError("Unexpected format. Expected something like EK-01-A03-FK-01")
    return code


class VerifyRequest(BaseModel):
    postcode: str
    consent: bool = Field(description="The user has agreed to this specific check")
    requested: list[Claim] = Field(min_length=1)
    expected_lga: str | None = Field(
        default=None,
        description="Needed for lga_match. We answer yes/no and never reveal the LGA.",
    )

    @field_validator("postcode")
    @classmethod
    def _check_postcode(cls, v: str) -> str:
        return normalise_postcode(v)

    @model_validator(mode="after")
    def _need_expected_lga(self):
        if Claim.lga_match in self.requested and not self.expected_lga:
            raise ValueError("expected_lga is required when requesting lga_match")
        return self