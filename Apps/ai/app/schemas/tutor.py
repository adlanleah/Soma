from pydantic import BaseModel
from typing import Optional


class TutorQueryRequest(BaseModel):
    school_code: str
    student_id: str
    course_resource_ids: list[str]  # which uploaded resources to search
    age_group: str  # "6-10" | "11-13" | "14-16" | "17-18"
    question: str


class TutorQueryResponse(BaseModel):
    answer: str
    sources_used: int
    flagged: bool
    flag_reason: Optional[str] = None

class TutorQueryRequest(BaseModel):
    school_code: str
    student_id: str
    course_resource_ids: list[str]
    age_group: str
    question: str
    is_within_access_window: bool  # ← NestJS checks the schedule, passes this flag