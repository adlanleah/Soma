import json
from app.core.ollama_client import get_llm
from app.services.rag_service import retrieve_context
from app.prompts.quiz_prompts import build_quiz_prompt
from app.models.quiz import GenerateQuizRequest, GenerateQuizResponse, QuizQuestion


def generate_quiz(req: GenerateQuizRequest) -> GenerateQuizResponse:
    context = retrieve_context(req.school_code, req.course_resource_ids, req.topic)

    if not context:
        return GenerateQuizResponse(topic=req.topic, questions=[])

    prompt_template = build_quiz_prompt(req.age_group, req.topic, req.question_count)
    prompt = prompt_template.format(context=context)

    llm = get_llm(temperature=0.3)
    response = llm.invoke(prompt)
    content = response.content if hasattr(response, "content") else str(response)

    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]

    try:
        data = json.loads(cleaned)
        questions = [QuizQuestion(**q) for q in data.get("questions", [])]
    except (json.JSONDecodeError, TypeError):
        questions = []

    return GenerateQuizResponse(topic=req.topic, questions=questions)