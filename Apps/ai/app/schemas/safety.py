from pydantic import BaseModel
from typing import Literal, Optional


class SafetyCheckResult(BaseModel):
    flagged: bool
    severity: Literal["low", "medium", "high"] = "low"
    reason: Optional[str] = None