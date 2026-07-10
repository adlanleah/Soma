from fastapi import APIRouter
from app.core.ollama_client import get_llm
from app.services.rag_service import retrieve_context
from app.services.safety_service import check_safety
from app.prompts.tutor_prompts import build_tutor_system_prompt
from app.models.tutor import TutorQueryRequest, TutorQueryResponse

router = APIRouter()


@router.post("/tutor/query", response_model=TutorQueryResponse)
def tutor_query(req: TutorQueryRequest):
    context = retrieve_context(req.school_code, req.course_resource_ids, req.question)

    if not context:
        answer = (
            "This topic is not in your current curriculum yet. "
            "Please ask your teacher for more help."
        )
        return TutorQueryResponse(answer=answer, sources_used=0, flagged=False)

    system_prompt = build_tutor_system_prompt(req.age_group).format(context=context)

    llm = get_llm(temperature=0.4)
    response = llm.invoke([
        ("system", system_prompt),
        ("human", req.question),
    ])
    answer = response.content if hasattr(response, "content") else str(response)

    safety_result = check_safety(req.question, answer)

    return TutorQueryResponse(
        answer=answer,
        sources_used=context.count("---") + 1,
        flagged=safety_result.flagged,
        flag_reason=safety_result.reason,
    )