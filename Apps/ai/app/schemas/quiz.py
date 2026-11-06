from pydantic import BaseModel


class GenerateQuizRequest(BaseModel):
    school_code: str
    course_resource_ids: list[str]
    age_group: str
    topic: str
    question_count: int = 10


class QuizQuestion(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str  # "A" | "B" | "C" | "D"
    explanation: str


class GenerateQuizResponse(BaseModel):
    topic: str
    questions: list[QuizQuestion]


class GenerateExplanationRequest(BaseModel):
    school_code: str
    course_resource_ids: list[str]
    age_group: str
    topic: str


class GenerateExplanationResponse(BaseModel):
    topic: str
    explanation: str
    key_points: list[str]