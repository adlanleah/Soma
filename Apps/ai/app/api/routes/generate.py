from fastapi import APIRouter
from app.services.quiz_service import generate_quiz
from app.services.explanation_service import generate_explanation
from app.models.quiz import (
    GenerateQuizRequest,
    GenerateQuizResponse,
    GenerateExplanationRequest,
    GenerateExplanationResponse,
)

router = APIRouter()


@router.post("/generate/quiz", response_model=GenerateQuizResponse)
def generate_quiz_route(req: GenerateQuizRequest):
    return generate_quiz(req)


@router.post("/generate/explanation", response_model=GenerateExplanationResponse)
def generate_explanation_route(req: GenerateExplanationRequest):
    return generate_explanation(req)